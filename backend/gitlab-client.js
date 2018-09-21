const wretch = require('node-wretch');

module.exports = class Gitlab {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.client = wretch(`${baseURL}/api/v4`).headers({'PRIVATE-TOKEN': token});
  }

  // https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
  projectTags(projectId) {
    return this.client
      .url(`/projects/${encodeURIComponent(projectId)}/repository/tags`)
      .get()
      .json();
  }

  // https://docs.gitlab.com/ee/api/jobs.html#download-the-artifacts-archive
  downloadArtifacts(projectId, refName, job) {
    return this.client
      .url(
        `/projects/${encodeURIComponent(
          projectId
        )}/jobs/artifacts/${refName}/download?job=${job}`
      )
      .get()
      .res(res => {
        console.log('res', res);
        return res.body;
      });
  }
};
