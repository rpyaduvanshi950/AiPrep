// API wrapper for backend endpoints and SSE
export async function fetchQuestions() {
  const res = await fetch('/api/questions');
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAnswer(id) {
  const res = await fetch(`/api/answers/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function postQuestion(question) {
  // Always send userId as required by backend
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', question }),
  });
  if (!res.ok) return null;
  return res.json();
}

export function subscribeStream({ onQuestion, onAnswer }) {
  const es = new window.EventSource('/api/stream');
  es.addEventListener('question_created', (e) => {
    const data = JSON.parse(e.data);
    if (data && data.question) onQuestion && onQuestion(data.question);
  });
  es.addEventListener('answer_created', (e) => {
    const data = JSON.parse(e.data);
    if (data && data.answer) onAnswer && onAnswer(data.answer);
  });
  return es;
}
