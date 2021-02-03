const { graphql } = require("@octokit/graphql");
const fs = require("fs");

require("dotenv").config();

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  },
});

const PLATFORM_DELIVERABLE = "css";
const variables = {
  owner: process.env.GITHUB_REPO_OWNER,
  name: process.env.GITHUB_REPO_NAME,
  tree: `${process.env.GITHUB_REPO_BRANCH}:output/${PLATFORM_DELIVERABLE}`,
};

async function main() {
  const { repository } = await graphqlWithAuth(
    `
    query FetchDesignTokens($owner: String!, $name: String!, $tree: String!) {
      repository(name: $name, owner: $owner) {
        content: object(expression: $tree) {
          ... on Tree {
            entries {
              name
              object {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }
    `,
    variables
  );
  
  repository.content.entries.forEach(({ name, object: { text } }) => {
    fs.writeFileSync(`./src/tokens/${name}`, text);
  });
}

main();
