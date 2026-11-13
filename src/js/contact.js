/* ============================================================
   Bytewiz — contact form (progressive enhancement)
   Lightweight, accessible validation reusing the approved error /
   success states. It does not send anything (matching the approved
   mockup copy); it only demonstrates the interaction.
   ============================================================ */

const ERR_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4M12 16h.01"></path></svg>';

const OK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function fieldOf(input) {
  return input.closest('.field');
}

function setError(input, message) {
  const field = fieldOf(input);
  if (!field) return;
  field.classList.add('is-error');
  input.setAttribute('aria-invalid', 'true');
  let err = field.querySelector('.ferr');
  if (!err) {
    err = document.createElement('span');
    err.className = 'ferr';
    err.setAttribute('role', 'alert');
    field.appendChild(err);
  }
  err.innerHTML = `${ERR_ICON}${message}`;
}

function clearError(input) {
  const field = fieldOf(input);
  if (!field) return;
  field.classList.remove('is-error');
  input.removeAttribute('aria-invalid');
}

export function initContactForm() {
  const card = document.querySelector('.form-card');
  if (!card) return;

  const submit = card.querySelector('.btn-submit');
  if (!submit) return;

  const fields = [
    { el: card.querySelector('#f-name'), msg: 'Please enter your name.' },
    {
      el: card.querySelector('#f-email'),
      msg: 'Enter a valid email address.',
      test: (v) => isEmail(v),
    },
    { el: card.querySelector('#f-interest'), msg: 'Please choose an option.' },
    {
      el: card.querySelector('#f-msg'),
      msg: 'Please tell us a little about your requirement.',
    },
  ].filter((f) => f.el);

  // Clear a field's error as soon as the person corrects it.
  for (const { el } of fields) {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (fieldOf(el)?.classList.contains('is-error')) clearError(el);
    });
  }

  submit.addEventListener('click', () => {
    let firstInvalid = null;

    for (const { el, msg, test } of fields) {
      const value = el.value.trim();
      const valid = value !== '' && (test ? test(value) : true);
      if (!valid) {
        setError(el, msg);
        if (!firstInvalid) firstInvalid = el;
      } else {
        clearError(el);
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    showSuccess(card, submit);
  });
}

function showSuccess(card, submit) {
  // Reuse the approved success note styling.
  let note = card.querySelector('.form-success');
  if (!note) {
    note = document.createElement('div');
    note.className = 'note-ok form-success';
    note.setAttribute('role', 'status');
    note.style.marginBottom = '18px';
    note.innerHTML = `<span class="ic">${OK_ICON}</span><div><b>Thank you — your inquiry has been noted.</b><p>This is a design mockup, so nothing was sent. A Bytewiz team member would follow up by email.</p></div>`;
    card.insertBefore(note, card.firstElementChild?.nextSibling || null);
  }

  // Reset the live fields.
  card
    .querySelectorAll('.inp')
    .forEach((i) => {
      if (!i.readOnly) i.value = '';
    });

  note.scrollIntoView({ behavior: 'smooth', block: 'center' });
  submit.blur();
}
