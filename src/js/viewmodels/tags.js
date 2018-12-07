export default function createTagsElement() {
  [].forEach.call(document.getElementsByClassName('tags-input'), (el) => {
    const hiddenInput = document.createElement('input');
    const mainInput = document.createElement('input');
    const tags = [];

    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', el.getAttribute('data-name'));

    mainInput.setAttribute('type', 'text');
    mainInput.classList.add('main-input');
    mainInput.placeholder = 'Add comma separated tags';

    function filterTag(tag) {
      return tag.replace(/[^\w -]/g, '').trim();
    }

    function refreshTags() {
      const tagsList = [];
      tags.forEach((t) => {
        tagsList.push(t.text);
      });
      hiddenInput.value = tagsList.join(',');
    }

    function removeTag(index) {
      if (index === 0) {
        mainInput.placeholder = 'Add comma separated tags';
      }
      const tag = tags[index];
      tags.splice(index, 1);
      el.removeChild(tag.element);
      refreshTags();
    }

    function addTag(text) {
      mainInput.placeholder = '';
      const tag = {
        text,
        element: document.createElement('span'),
      };

      tag.element.classList.add('tag');
      tag.element.textContent = tag.text;

      const closeBtn = document.createElement('span');
      closeBtn.classList.add('close');
      closeBtn.addEventListener('click', () => {
        removeTag(tags.indexOf(tag));
      });
      tag.element.appendChild(closeBtn);

      tags.push(tag);

      el.insertBefore(tag.element, mainInput);

      refreshTags();
    }

    mainInput.addEventListener('input', () => {
      const enteredTags = mainInput.value.split(',');
      if (enteredTags.length > 1) {
        enteredTags.forEach((t) => {
          const filteredTag = filterTag(t);
          if (filteredTag.length > 0) { addTag(filteredTag); }
        });
        mainInput.value = '';
      }
    });


    mainInput.addEventListener('keydown', (e) => {
      const keyCode = e.which || e.keyCode;
      if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
        e.preventDefault();
        removeTag(tags.length - 1);
      } else if (keyCode === 13) {
        e.preventDefault();
        document.getElementById('sendTags').click();
      }
    });

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);
  });
}
