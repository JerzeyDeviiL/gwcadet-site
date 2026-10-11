// GW Cadet site: the waitlist form.

// Waitlist destination: a Google Form owned by admin@gwcadet.com.
// Fill both in once the form exists (see README.md). While they are empty,
// the form falls back to opening an email to admin@gwcadet.com.
const WAITLIST = {
  formAction: '', // https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
  emailEntry: '', // entry.<NUMBER> of the email question
};

// ---- waitlist -------------------------------------------------------------
document.querySelectorAll('[data-waitlist]').forEach((form) => {
  const input = form.querySelector('input[type="email"]');
  const note = form.querySelector('.form-note');
  const button = form.querySelector('button[type="submit"]');
  const say = (text, state) => { note.textContent = text; note.dataset.state = state || ''; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.setAttribute('aria-invalid', 'true');
      say('Enter an email address like name@school.org.', 'error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');

    if (!WAITLIST.formAction || !WAITLIST.emailEntry) {
      const body = encodeURIComponent(`Please add ${email} to the GW Cadet waitlist.`);
      window.location.href = `mailto:admin@gwcadet.com?subject=GW%20Cadet%20waitlist&body=${body}`;
      say('Your email app should open with a message ready to send.', '');
      return;
    }

    button.disabled = true;
    say('Adding you to the list…', '');
    try {
      const data = new URLSearchParams();
      data.set(WAITLIST.emailEntry, email);
      // Google Forms does not send CORS headers; no-cors posts still record.
      await fetch(WAITLIST.formAction, { method: 'POST', mode: 'no-cors', body: data });
      form.reset();
      say("You're on the list. We'll email you when GW Cadet is ready to install.", 'done');
    } catch (err) {
      say("That didn't go through. Check your connection and try again, or email admin@gwcadet.com.", 'error');
    } finally {
      button.disabled = false;
    }
  });
});
