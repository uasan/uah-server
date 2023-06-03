export const fetchOpenId = async (url, params) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const { error, error_description } = await response.json();

    throw {
      status: response.status,
      errors: [
        {
          type: error,
          message: error_description,
        },
      ],
    };
  }

  return await response.json();
};
