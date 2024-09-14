document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-button');
    const moodOutput = document.getElementById('mood-output');

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.getAttribute('data-mood');
            switch (mood) {
                case '1':
                    moodOutput.textContent = 'You are very angry 😠';
                    break;
                case '2':
                    moodOutput.textContent = 'You are sad 😟';
                    break;
                case '3':
                    moodOutput.textContent = 'You are neutral 😐';
                    break;
                case '4':
                    moodOutput.textContent = 'You are happy 😊';
                    break;
                case '5':
                    moodOutput.textContent = 'You are very happy 😁';
                    break;
                default:
                    moodOutput.textContent = '';
            }
        });
    });
});
