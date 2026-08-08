import { NextRequest, NextResponse } from 'next/server';
import { addTranscriptItem, createSession, getSession, markDayCovered, updateSession } from '@/lib/sessionStore';
import { generateFinalFeedback, generateInterviewerTurn } from '@/lib/gemini';
import { Candidate } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, candidate, message } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // 1. START INTERVIEW SESSION
    if (candidate) {
      const session = createSession(sessionId, candidate as Candidate);
      
      let replyText = "Welcome! I'm your Senior Tech Lead interviewer. Let's begin by discussing your background and work in the AI Cohort.";
      try {
        const turn = await generateInterviewerTurn(session);
        replyText = turn.reply;
        if (turn.coveredDay) {
          markDayCovered(sessionId, turn.coveredDay);
        } else if (session.focusDays.length > 0) {
          markDayCovered(sessionId, session.focusDays[0].day);
        }
      } catch (err) {
        console.error('Error generating first question with Gemini:', err);
        // Fallback initial question if API key is not yet set or fails
        const firstFocus = session.focusDays[0];
        replyText = `Welcome ${candidate.member.name}! Let's dive right in. To start off, I'd like to ask about Day ${firstFocus?.day || 7}: ${firstFocus?.title || 'Embeddings'}. Could you walk me through your implementation and key decisions?`;
        if (firstFocus) {
          markDayCovered(sessionId, firstFocus.day);
        }
      }

      addTranscriptItem(sessionId, { role: 'interviewer', content: replyText });
      updateSession(sessionId, { questionCount: 1 });

      return NextResponse.json({
        reply: replyText,
        done: false
      });
    }

    // 2. CONVERSATION TURN OR END INTERVIEW
    if (message !== undefined) {
      let session = getSession(sessionId);

      // If session not found in memory, recreate if candidate info is available or return error
      if (!session) {
        return NextResponse.json({ error: 'Session not found. Please start a new interview session.' }, { status: 404 });
      }

      // Add candidate's message to transcript
      addTranscriptItem(sessionId, { role: 'candidate', content: message });

      // Check if interview targets are met:
      // Minimum 8 questions asked AND at least 4 curriculum days covered
      const isTargetMet = session.questionCount >= 8 && session.coveredDays.size >= 4;
      const isMaxLimit = session.questionCount >= 12; // safety threshold

      if (isTargetMet || isMaxLimit) {
        updateSession(sessionId, { done: true });
        
        let feedback;
        try {
          feedback = await generateFinalFeedback(session);
        } catch (err) {
          console.error('Error generating feedback:', err);
          feedback = {
            summary: `Candidate ${session.candidate.member.name} completed the evaluation across ${session.coveredDays.size} curriculum days.`,
            strengths: ["Solid engagement throughout interview", "Covered key cohort technical topics"],
            gaps: ["Can deepen explanations for complex edge cases"],
            next: ["Review advanced fine-tuning and deployment architecture"]
          };
        }

        const wrapUpReply = "Thank you for completing the technical interview! I have compiled your technical assessment feedback report.";
        addTranscriptItem(sessionId, { role: 'interviewer', content: wrapUpReply });
        updateSession(sessionId, { feedback });

        return NextResponse.json({
          reply: wrapUpReply,
          done: true,
          feedback
        });
      }

      // Generate next turn question
      let nextReply = '';
      try {
        const turn = await generateInterviewerTurn(session);
        nextReply = turn.reply;

        if (turn.coveredDay) {
          markDayCovered(sessionId, turn.coveredDay);
        } else {
          // Track coverage sequentially based on focusDays index if tag missed
          const unvisitedFocus = session.focusDays.find(fd => !session.coveredDays.has(fd.day));
          if (unvisitedFocus) {
            markDayCovered(sessionId, unvisitedFocus.day);
          }
        }
      } catch (err) {
        console.error('Error generating turn with Gemini:', err);
        // Fallback turn if LLM fails
        const currentCount = session.questionCount + 1;
        const unvisitedFocus = session.focusDays.find(fd => !session.coveredDays.has(fd.day)) || session.focusDays[currentCount % session.focusDays.length];
        nextReply = `That makes sense. Moving on to Day ${unvisitedFocus.day} (${unvisitedFocus.title}), could you explain how you handled the main objectives and tool selection for that module?`;
        markDayCovered(sessionId, unvisitedFocus.day);
      }

      addTranscriptItem(sessionId, { role: 'interviewer', content: nextReply });
      updateSession(sessionId, { questionCount: session.questionCount + 1 });

      return NextResponse.json({
        reply: nextReply,
        done: false
      });
    }

    return NextResponse.json({ error: 'Invalid request body. Expected candidate object or message string.' }, { status: 400 });

  } catch (error: any) {
    console.error('Interview API error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
