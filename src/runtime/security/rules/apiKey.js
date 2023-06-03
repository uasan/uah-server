const apis = {
  skill_extraction: 'skill_extraction',
  data_upload: 'data_upload',
  job_standardization: 'job_standardization',
  jobs_library: 'jobs_library',
  skills_library: 'skills_library',
  users_details: 'users_details',
  users_search: 'users_search',
};

const isValidApiKey = async ({ sql, request }, payload, feature) => {
  if (!payload?.api_key) return false;
  return await sql`
  SELECT EXISTS(
    SELECT api_key
    FROM ludicloud.api_keys api
    WHERE api.api_key = ${payload.api_key}
      AND ${feature} = any (api.apis)
      AND (array_length (ip_list, 1) is null OR ${request.ip} = ANY(ip_list))
  ) AS "0"`.findOneValue();
};

export const hasDataUploadByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.data_upload);

export const hasSkillsByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.skills_library);

export const hasJobsByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.jobs_library);

export const hasSkillExtractionByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.skill_extraction);

export const hasJobStandardizationByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.job_standardization);

export const hasUsersDetailsByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.users_details);

export const hasUsersSearchByApiKeyAccess = async (context, payload) =>
  await isValidApiKey(context, payload, apis.users_search);
