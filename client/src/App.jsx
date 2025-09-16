
import React, { useEffect, useState, useRef } from 'react';
import ChatBox from './components/ChatBox.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import VisualizationCanvas from './components/VisualizationCanvas.jsx';
import { fetchQuestions, fetchAnswer, postQuestion, subscribeStream } from './api.js';
import './styles.css';

// Normalize backend visualization spec to what VisualizationCanvas expects
function normalizeVisSpec(spec) {
  if (!spec || !Array.isArray(spec.layers)) return spec;
  return {
    ...spec,
    layers: spec.layers.map((layer) => {
      let { type, props = {}, animations = [] } = layer;
      let newProps = { ...props };
      if (type === 'circle') {
        if ('radius' in newProps) {
          newProps.r = newProps.radius;
          delete newProps.radius;
        }
      }
      if (type === 'rect') {
        if ('width' in newProps) {
          newProps.w = newProps.width;
          delete newProps.width;
        }
        if ('height' in newProps) {
          newProps.h = newProps.height;
          delete newProps.height;
        }
      }
      if (type === 'arrow') {
        // Convert start_x, start_y, end_x, end_y to x, y, dx, dy
        if ('start_x' in newProps && 'end_x' in newProps) {
          newProps.dx = newProps.end_x - newProps.start_x;
          newProps.x = newProps.start_x;
          delete newProps.start_x;
          delete newProps.end_x;
        }
        if ('start_y' in newProps && 'end_y' in newProps) {
          newProps.dy = newProps.end_y - newProps.start_y;
          newProps.y = newProps.start_y;
          delete newProps.start_y;
          delete newProps.end_y;
        }
      }
      return { ...layer, props: newProps, animations };
    }),
  };
}

export default function App() {
  const [chat, setChat] = useState([]); // {id, question, answer, answerId, visualization}
  const [currentVis, setCurrentVis] = useState(null);
  const [loading, setLoading] = useState(false); // Only for initial load
  const eventSourceRef = useRef(null);

  // Fetch chat history and answers on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const questions = await fetchQuestions();
      const chatItems = await Promise.all(
        questions.map(async (q) => {
          let answer = null, visualization = null;
          if (q.answerId) {
            answer = await fetchAnswer(q.answerId);
            visualization = answer?.visualization ? normalizeVisSpec(answer.visualization) : null;
          }
          return { ...q, answer: answer?.text, visualization };
        })
      );
      if (!mounted) return;
      setChat(chatItems.reverse());
      const latestVis = chatItems.find((c) => c.visualization);
      if (latestVis) setCurrentVis(latestVis.visualization);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // SSE subscription
  useEffect(() => {
    if (eventSourceRef.current) return;
    eventSourceRef.current = subscribeStream({
      onQuestion: (q) => {
        console.log('[SSE] question_created', q);
        setChat((prev) => [{ ...q, answer: null, visualization: null }, ...prev]);
      },
      onAnswer: (a) => {
        console.log('[SSE] answer_created', a);
        setChat((prev) => {
          const idx = prev.findIndex((item) => item.id === a.questionId);
          if (idx !== -1) {
            // Merge answer into existing question
            return prev.map((item) =>
              item.id === a.questionId
                ? { ...item, answer: a.text, visualization: a.visualization ? normalizeVisSpec(a.visualization) : null }
                : item
            );
          } else {
            // If question not found, add as new chat item (fallback)
            return [
              {
                id: a.questionId,
                question: '',
                answer: a.text,
                answerId: a.id,
                visualization: a.visualization ? normalizeVisSpec(a.visualization) : null
              },
              ...prev
            ];
          }
        });
        if (a.visualization) setCurrentVis(normalizeVisSpec(a.visualization));
      },
    });
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  // Send question
  async function handleSend(question) {
    // Show question immediately with 'Writing...' placeholder
    const tempId = 'pending_' + Date.now();
    setChat((prev) => [
      {
        id: tempId,
        question,
        answer: null,
        answerId: null,
        visualization: null,
        timestamp: Date.now()
      },
      ...prev
    ]);

    // Send question and fetch answer
    const res = await postQuestion(question);
    if (res && res.status === 'answer_generated' && res.answerId) {
      const answer = await fetchAnswer(res.answerId);
      if (answer) {
        setChat((prev) => prev.map((item) =>
          item.id === tempId
            ? {
                ...item,
                id: answer.questionId || tempId,
                answer: answer.text,
                answerId: answer.id,
                visualization: answer.visualization || null,
                timestamp: answer.timestamp || item.timestamp
              }
            : item
        ));
        if (answer.visualization) setCurrentVis(answer.visualization);
      }
    }
  }

  return (
    <div className="app-root">
      <div className="vis-col">
        <VisualizationCanvas
          spec={currentVis}
        />
      </div>
      <div className="chat-col">
  <ChatPanel chat={chat} loading={loading} />
  <ChatBox onSend={handleSend} />
      </div>
    </div>
  );
}
