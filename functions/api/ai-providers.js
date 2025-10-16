export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const hasGLM = !!(env.GLM_API_KEY || env.ZHIPU_API_KEY);
    const hasDeepSeek = !!env.DEEPSEEK_API_KEY;
    const hasGemini = !!env.GEMINI_API_KEY;
    const hasOpenAI = !!env.OPENAI_API_KEY;

    const providers = [];
    if (hasGLM) providers.push({ id: 'glm', name: 'GLM-4.5-Air' });
    if (hasDeepSeek) providers.push({ id: 'deepseek', name: 'DeepSeek' });
    if (hasGemini) providers.push({ id: 'gemini', name: 'Gemini' });
    if (hasOpenAI) providers.push({ id: 'openai', name: 'OpenAI' });

    // Default priority: GLM > DeepSeek > Gemini > OpenAI
    const defaultId = hasGLM ? 'glm' : hasDeepSeek ? 'deepseek' : hasGemini ? 'gemini' : hasOpenAI ? 'openai' : null;

    return new Response(
      JSON.stringify({ providers, default: defaultId }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error.message || 'Failed to list providers.' } }),
      { status: 500, headers: corsHeaders }
    );
  }
}

