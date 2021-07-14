const prompts = require('prompts');

/**
 * ask the user for username & password
 */
async function get_credentials({ website_name }) {
  const { username } = await prompts({
    type: 'text',
    name: 'username',
    message: `What is your ${website_name} username?`,
  });

  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: `What is your ${website_name} password?`,
  });

  return {
      username,
      password
  };
}

module.exports = {
    get_credentials
};
