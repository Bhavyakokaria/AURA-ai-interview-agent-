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
      const session = await createSession(sessionId, candidate as Candidate);

      let replyText = "Welcome! I'm your Senior Tech Lead interviewer. Let's begin by discussing your background and work in the AI Cohort.";
      try {
        const turn = await generateInterviewerTurn(session);
        replyText = turn.reply;
        if (turn.coveredDay) {
          await markDayCovered(sessionId, turn.coveredDay);
        } else if (session.focusDays.length > 0) {
          await markDayCovered(sessionId, session.focusDays[0].day);
        }
      } catch (err) {
        console.error('Error generating first question with Gemini:', err);
        const firstFocus = session.focusDays[0];
        replyText = `Welcome ${candidate.member.name}! Let's dive right in. To start off, I'd like to ask about Day ${firstFocus?.day || 7}: ${firstFocus?.title || 'Embeddings'}. Could you walk me through your implementation and key decisions?`;
        if (firstFocus) {
          await markDayCovered(sessionId, firstFocus.day);
        }
      }

      await addTranscriptItem(sessionId, { role: 'interviewer', content: replyText });
      await updateSession(sessionId, { questionCount: 1 });

      return NextResponse.json({
        reply: replyText,
        done: false
      });
    }

    // 2. CONVERSATION TURN OR END INTERVIEW
    if (message !== undefined) {
      const session = await getSession(sessionId);

      if (!session) {
        return NextResponse.json({ error: 'Session not found. Please start a new interview session.' }, { status: 404 });
      }

      // Add candidate's message to transcript
      await addTranscriptItem(sessionId, { role: 'candidate', content: message });

      // Re-fetch session after transcript update so questionCount and coveredDays are current
      const updatedSession = await getSession(sessionId);
      if (!updatedSession) {
        return NextResponse.json({ error: 'Session not found after update.' }, { status: 404 });
      }

      // Check if interview targets are met:
      // Minimum 8 questions asked AND at least 4 curriculum days covered
      const isTargetMet = updatedSession.questionCount >= 8 && updatedSession.coveredDays.size >= 4;
      const isMaxLimit = updatedSession.questionCount >= 12; // safety threshold

      if (isTargetMet || isMaxLimit) {
        await updateSession(sessionId, { done: true });

        let feedback;
        try {
          feedback = await generateFinalFeedback(updatedSession);
        } catch (err) {
          console.error('Error generating feedback:', err);
          feedback = {
            summary: `Candidate ${updatedSession.candidate.member.name} completed the evaluation across ${updatedSession.coveredDays.size} curriculum days.`,
            strengths: ["Solid engagement throughout interview", "Covered key cohort technical topics"],
            gaps: ["Can deepen explanations for complex edge cases"],
            next: ["Review advanced fine-tuning and deployment architecture"]
          };
        }

        const wrapUpReply = "Thank you for completing the technical interview! I have compiled your technical assessment feedback report.";
        await addTranscriptItem(sessionId, { role: 'interviewer', content: wrapUpReply });
        await updateSession(sessionId, { feedback });

        return NextResponse.json({
          reply: wrapUpReply,
          done: true,
          feedback
        });
      }

      // Generate next turn question
      let nextReply = '';
      try {
        const turn = await generateInterviewerTurn(updatedSession);
        nextReply = turn.reply;

        if (turn.coveredDay) {
          await markDayCovered(sessionId, turn.coveredDay);
        } else {
          // Track coverage sequentially based on focusDays index if tag missed
          const unvisitedFocus = updatedSession.focusDays.find(fd => !updatedSession.coveredDays.has(fd.day));
          if (unvisitedFocus) {
            await markDayCovered(sessionId, unvisitedFocus.day);
          }
        }
      } catch (err) {
        console.error('Error generating turn with Gemini:', err);
        const currentCount = updatedSession.questionCount + 1;
        const unvisitedFocus = updatedSession.focusDays.find(fd => !updatedSession.coveredDays.has(fd.day)) || updatedSession.focusDays[currentCount % updatedSession.focusDays.length];
        nextReply = `That makes sense. Moving on to Day ${unvisitedFocus.day} (${unvisitedFocus.title}), could you explain how you handled the main objectives and tool selection for that module?`;
        await markDayCovered(sessionId, unvisitedFocus.day);
      }

      await addTranscriptItem(sessionId, { role: 'interviewer', content: nextReply });
      await updateSession(sessionId, { questionCount: updatedSession.questionCount + 1 });

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
