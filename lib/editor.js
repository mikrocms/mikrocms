const fs = require('fs').promises;
const { spawn } = require('child_process');

/**
 * Open editor.
 *
 * @param   string
 * @param   string
 * @param   boolean
 * @return  void
 */
async function open(filePath, fileContent, removeAfterOpen = true, returnAfterOpen = false) {
  const platform = process.platform;

  // Execute the command to open the file in the default editor
  return new Promise(async (resolve, reject) => {
    let command;

    // Determine the command based on the OS
    if (platform === 'win32') {
      command = 'start notepad'; // For Windows, using Notepad
    } else if (platform === 'darwin') {
      command = 'open'; // For macOS
    } else if (platform === 'linux') {
      command = 'xdg-open'; // For Linux
    } else {
      reject(new Error('Unsupported platform'));

      return;
    }

    await fs.writeFile(filePath, fileContent, 'utf8');

    const editor = spawn(command, [filePath]);

    editor.on('close', async (err) => {
      let resultContent = null;

      if (returnAfterOpen) {
        resultContent = await fs.readFile(filePath, 'utf8');
      }

      if (removeAfterOpen) {
        await fs.unlink(filePath);
      }

      if (err) {
        reject(err);
      } else {
        resolve(resultContent);
      }
    });
  });
}

module.exports = {
  open
};
