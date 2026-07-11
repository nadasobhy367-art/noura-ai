import { API_BASE_URL, API_UNAVAILABLE_MESSAGE } from '../config/api';

const getToken = () => sessionStorage.getItem('auth_token');

/**
 * يرسل الرسالة إلى API server محلي/خلفي حتى لا يتم كشف مفاتيح الذكاء الاصطناعي في الواجهة.
 * history: مصفوفة من الرسائل السابقة [{ role: 'user' | 'assistant', content: string }]
 */
export async function sendMessageToMedicalAI(message, history = []) {
  if (!String(message || '').trim()) throw new Error('EMPTY_MESSAGE');

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });
  } catch (error) {
    const networkError = new Error(API_UNAVAILABLE_MESSAGE);
    networkError.code = 'API_UNAVAILABLE';
    networkError.cause = error;
    throw networkError;
  }

  if (!response.ok) {
    let errorCode = 'AI_REQUEST_FAILED';

    try {
      const errorData = await response.json();
      errorCode = errorData?.code || errorCode;
    } catch {
      if (response.status === 401 || response.status === 403) errorCode = 'AI_UNAUTHORIZED';
      if (response.status === 429) errorCode = 'AI_RATE_LIMIT';
      if (response.status >= 500) errorCode = 'AI_SERVER_UNAVAILABLE';
    }

    throw new Error(errorCode);
  }

  const data = await response.json();
  const aiMessage = data?.reply || 'لم أستطع فهم سؤالك، حاول صياغته بشكل آخر.';

  return aiMessage;
}
