/**
 * Created by XRene on 16/8/22.
 */

module.exports = {
    dialogConfig: {
        properties: ['openFile', 'openDirectory', 'multiSelections'],
        filters: [
            {name: 'Images', extensions: ['jpg', 'png', 'gif']},
            {name: 'Html', extensions: ['html', 'php']},
            {name: 'css', extensions: ['css', 'less', 'sass', 'scss']},
            {name: 'js', extensions: ['js', 'jsx']},
            {name: 'All Files', extensions: ['*']}
        ]
    }
}