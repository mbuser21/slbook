// =============================================================
//  Medical Appointment Booking — App Logic
//  React 18 · Babel standalone · No build step
// =============================================================

// ── Data ──────────────────────────────────────────────────────

const INSTITUTES = ['Modern', 'MC', 'Uttora'];

const RECEPTION_NUMBERS = {
  Modern: '01741855980',
  MC:     '01313-735555',
  Uttora: '01300-321343',
};

const INSTITUTE_IMAGES = {
  Modern: 'md.png',
  MC:     'mc.png',
  Uttora: 'ut.png',
};

const INSTITUTE_DOCTORS = {
  Modern: [
    { name: '👨‍⚕️ পার্থ সারথী দাস',      id: 'partha_sarathi_das'  },
    { name: '👨‍⚕️ পদ্ম মোহন সিনহা',      id: 'padma_mohan_sinha'   },
    { name: '👨‍⚕️ রফিকুল ইসলাম হাজারী',  id: 'rafiqul_islam_hazari'},
    { name: '👨‍⚕️ মাহফুজ আহমেদ',          id: 'mahfuz_ahmed'        },
    { name: '👩‍⚕️ পার্লী দাশ',            id: 'parlee_dash'         },
    { name: '👩‍⚕️ মৌমিতা জামান খান',      id: 'moumita_jaman_khan'  },
    { name: '👨‍⚕️ এখলাছ ভুঁইয়া',          id: 'ekhlas_bhuiyan'      },
    { name: '👨‍⚕️ শাহ দিদার ইমাম',        id: 'shah_didar_imam'     },
    { name: '👨‍⚕️ এনায়েত করিম',           id: 'enayet_karim'        },
    { name: '👨‍⚕️ সোহেল রানা',            id: 'sohel_rana'          },
    { name: '👨‍⚕️ ইফতেখারুল আলম',         id: 'iftekharul_alam'     },
    { name: '👩‍⚕️ রিদিতা রায় তুলি',      id: 'ridita_roy_tuli'     },
    { name: '👨‍⚕️ রাজীব দাস',             id: 'rajeeb_das'          },
    { name: '👨‍⚕️ কাওছার আহমদ',           id: 'kawsar'              },
    { name: '👨‍⚕️ সালেহ আহমদ তাহলিল',    id: 'tohlil'              },
    { name: '👩‍⚕️ তাসফিয়া আহমেদ শর্মি',  id: 'sormi'               },
  ],
  MC: [
    { name: '👩‍⚕️ সাদিয়া খান',           id: 'sadia_khan'          },
    { name: '👨‍⚕️ অরূপ রাউৎ',            id: 'arup_raut'           },
    { name: '👨‍⚕️ সোহান মাহমুদ',          id: 'sohan_mahmud'        },
    { name: '👨‍⚕️ মনোরঞ্জন সরকার',        id: 'monoranjon_sarkar'   },
    { name: '👨‍⚕️ এ. কে. ফজলুল হক',      id: 'fozlul_hok'          },
    { name: '👨‍⚕️ শুভ্র তুষার সিংহ',      id: 'shuvrot'             },
  ],
  Uttora: [
    { name: '👨‍⚕️ এ.কে. জিলুল হক',              id: 'jillu'        },
    { name: '👨‍⚕️ মোঃ আরিফুজ্জামান (পলাশ)',      id: 'arifpolash'   },
    { name: '👨‍⚕️ আব্দুল মোকাদ্দেম মাসুদ',       id: 'mmasud'       },
    { name: '👨‍⚕️ সাহেদ আহমেদ সুমন',             id: 'sam'          },
    { name: '👨‍⚕️ সব্যসাচী পাল তমাল',            id: 'stomal'       },
    { name: '👨‍⚕️ মোহাম্মদ হুমায়ুন কবীর',        id: 'humayun'      },
    { name: '👨‍⚕️ অমৃত লাল দাস',                 id: 'omrito'       },
    { name: '👨‍⚕️ সাকির আহমদ শাহীন',             id: 'sakirsahin'   },
    { name: '👨‍⚕️ মোঃ ফয়সল আহমেদ',              id: 'mdfoysol'     },
    { name: '👨‍⚕️ সুদীপ্ত ধর শাওন',              id: 'sudiptosawn'  },
    { name: '👨‍⚕️ রিয়াজুল জান্নাত মাসুম',        id: 'rjmasum'      },
  ],
};

// H = Hold, P = Priority — suffix stripped before display on output card
const SERIAL_NUMBERS = [3, 4, 5, 6, 7, 8, '15 H', '16 H', '25 P', '26 P'];

// Google Apps Script endpoint for sheet logging
const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzWs4ZUOv0Zq2dlRtvQN7T-6ZPOReybM2Ng4xk5gvht6z71XWTcvA3DwxqSV_YU9W_3/exec';

// ── Helpers ───────────────────────────────────────────────────

/**
 * Strip the " H" / " P" suffix from serial labels before showing on the output card.
 * e.g. "15 H" → "15"
 */
function cleanSerial(serial) {
  if (typeof serial === 'string') return serial.replace(/ [HP]$/, '');
  return serial;
}

/**
 * Send appointment data to Google Sheets (fire-and-forget).
 * Uses mode:"no-cors" so the response is always opaque — we only
 * care that the request was dispatched, not what it returns.
 */
async function logToSheet({ phone, age, doctorName, institute }) {
  const body = new URLSearchParams({ phone, age, doctor: doctorName, institute });
  await fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body });
  // Response is intentionally ignored (opaque due to no-cors)
}

// ── Component ─────────────────────────────────────────────────

const App = () => {
  const [institute,      setInstitute]      = React.useState('Modern');
  const [patientName,    setPatientName]    = React.useState('');
  const [patientAge,     setPatientAge]     = React.useState('');
  const [phoneNumber,    setPhoneNumber]    = React.useState('');
  const [selectedDoctor, setSelectedDoctor] = React.useState('');
  const [selectedSerial, setSelectedSerial] = React.useState(null);
  const [attendTime,     setAttendTime]     = React.useState('');
  const [output,         setOutput]         = React.useState(null);   // { data } | { error }
  const [saving,         setSaving]         = React.useState(false);
  const [copyMsg,        setCopyMsg]        = React.useState('');

  // Reset doctor selection when institute changes
  React.useEffect(() => { setSelectedDoctor(''); }, [institute]);

  // ── Handlers ────────────────────────────────────────────────

  const handleGenerate = async () => {
    // Basic validation
    if (!patientName || !patientAge || !phoneNumber || !selectedDoctor || !selectedSerial || !attendTime) {
      setOutput({ error: 'Please fill in all required fields.' });
      return;
    }

    const doctorName = INSTITUTE_DOCTORS[institute].find(d => d.id === selectedDoctor)?.name ?? 'N/A';

    // Optimistically show output immediately
    setOutput({
      data: {
        name:       patientName,
        doctor:     doctorName,
        serial:     cleanSerial(selectedSerial),
        attendTime,
        phone:      phoneNumber,
        age:        patientAge,
      }
    });

    // Fire-and-forget sheet logging
    try {
      setSaving(true);
      await logToSheet({ phone: phoneNumber, age: patientAge, doctorName, institute });
    } catch (err) {
      console.error('Sheet logging failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!output?.data) return;
    const { name, doctor, serial, attendTime, phone } = output.data;
    const text = `Name: ${name}\n\n${doctor}\n\nSL No: ${serial}\n🕝: ${attendTime} (Aprx)\n📱: ${phone}`;

    // Fallback clipboard write for older browsers / WebViews
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      setCopyMsg('✓ Copied to clipboard!');
    } catch {
      setCopyMsg('Copy failed — please copy manually.');
    }
    document.body.removeChild(el);
    setTimeout(() => setCopyMsg(''), 3000);
  };

  const handleClear = () => {
    setPatientName('');
    setPatientAge('');
    setPhoneNumber('');
    setSelectedDoctor('');
    setSelectedSerial(null);
    setAttendTime('');
    setOutput(null);
    setCopyMsg('');
  };

  // ── Render ───────────────────────────────────────────────────

  const doctors = INSTITUTE_DOCTORS[institute];

  return (
    <div className="card">
      {/* ── Header ── */}
      <h1 className="page-title">🏥 Medical Appointment</h1>

      {/* ── Institute tabs ── */}
      <div className="tab-bar">
        {INSTITUTES.map(inst => (
          <label key={inst} className={institute === inst ? 'active' : ''}>
            <input
              type="radio"
              name="institute"
              value={inst}
              checked={institute === inst}
              onChange={() => setInstitute(inst)}
            />
            {inst}
          </label>
        ))}
      </div>

      {/* ── Reception number ── */}
      <div className="reception-banner">
        {institute} Reception: {RECEPTION_NUMBERS[institute]}
      </div>

      {/* ── Hospital image ── */}
      <img
        src={INSTITUTE_IMAGES[institute]}
        alt={`${institute} hospital`}
        className="hospital-img"
        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x160/cccccc/555555?text=Image+Unavailable'; }}
      />

      {/* ── Form ── */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          className="field"
        />
        <input
          type="number"
          placeholder="Patient Age"
          value={patientAge}
          min="0"
          onChange={e => setPatientAge(e.target.value)}
          className="field"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          className="field"
        />

        <select
          value={selectedDoctor}
          onChange={e => setSelectedDoctor(e.target.value)}
          className="field"
        >
          <option value="" disabled>Select Doctor</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>

        {/* Serial number picker */}
        <div>
          <p className="serial-label">Select Serial Number</p>
          <div className="serial-grid">
            {SERIAL_NUMBERS.map(serial => (
              <button
                key={serial}
                onClick={() => setSelectedSerial(serial)}
                className={`serial-btn${selectedSerial === serial ? ' selected' : ''}`}
              >
                {serial}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Attend Time (e.g. 10:30 AM)"
          value={attendTime}
          onChange={e => setAttendTime(e.target.value)}
          className="field"
        />
      </div>

      {/* ── Generate button ── */}
      <button onClick={handleGenerate} className="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Generate Appointment'}
      </button>

      {/* ── Output ── */}
      {output && (
        <div className="output-card">
          <p className="output-title">Generated Output</p>

          {output.error ? (
            <div className="msg-error">{output.error}</div>
          ) : (
            <>
              <div className="output-body">
                <p>Name: <em>{output.data.name}</em></p>
                <p>{output.data.doctor}</p>
                <p>SL No: {output.data.serial}</p>
                <p>🕝 {output.data.attendTime} (Aprx)</p>
                <p>📱 {output.data.phone}</p>
              </div>

              <div className="output-actions">
                <button onClick={handleCopy}  className="btn-secondary copy">Copy Output</button>
                <button onClick={handleClear} className="btn-secondary clear">Clear</button>
              </div>

              {copyMsg && <p className="msg-success">{copyMsg}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Mount ─────────────────────────────────────────────────────
ReactDOM.render(<App />, document.getElementById('root'));
