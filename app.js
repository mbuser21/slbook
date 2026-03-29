// =============================================================
//  Medical Appointment Booking — App Logic
//  React 18 · Babel standalone · No build step
// =============================================================

// ── Data ──────────────────────────────────────────────────────
//
//  Two-level hierarchy:  Location  ──▶  Institute
//
//  To add a NEW LOCATION in the future:
//    1. Add its key to LOCATIONS
//    2. Add its display label to LOCATION_META
//    3. Add its institute keys to LOCATION_INSTITUTES
//    4. Add each institute's entry to INSTITUTES
//
//  To add a NEW INSTITUTE to an existing location:
//    1. Add its key to the relevant LOCATION_INSTITUTES array
//    2. Add its entry to INSTITUTES
// =============================================================

const LOCATIONS = ['MB', 'Sylhet'];

const LOCATION_META = {
  MB:     { label: 'MB' },
  Sylhet: { label: 'SYL'      },
};

const LOCATION_INSTITUTES = {
  MB:     ['Modern', 'MC', 'Uttora'],
  Sylhet: ['ASMS'],
};

// H = Hold, P = Priority — suffix stripped before display on output card
const SERIAL_NUMBERS = [3, 4, 5, 6, 7, 8, '15 H', '16 H', '25 P', '26 P'];

// Google Apps Script endpoint for sheet logging
const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzWs4ZUOv0Zq2dlRtvQN7T-6ZPOReybM2Ng4xk5gvht6z71XWTcvA3DwxqSV_YU9W_3/exec';

// ── Institute registry ────────────────────────────────────────
//  Each entry: { label, reception, image, doctors[] }

const INSTITUTES = {

  // ── Moulvibazar ──────────────────────────────────────────────

  Modern: {
    label:     'Modern',
    reception: '01741855980',
    image:     'md.png',
    doctors: [
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
  },

  MC: {
    label:     'MC',
    reception: '01313-735555',
    image:     'mc.png',
    doctors: [
      { name: '👩‍⚕️ সাদিয়া খান',      id: 'sadia_khan'        },
      { name: '👨‍⚕️ অরূপ রাউৎ',       id: 'arup_raut'         },
      { name: '👨‍⚕️ সোহান মাহমুদ',     id: 'sohan_mahmud'      },
      { name: '👨‍⚕️ মনোরঞ্জন সরকার',   id: 'monoranjon_sarkar' },
      { name: '👨‍⚕️ এ. কে. ফজলুল হক', id: 'fozlul_hok'        },
      { name: '👨‍⚕️ শুভ্র তুষার সিংহ', id: 'shuvrot'           },
    ],
  },

  Uttora: {
    label:     'Uttora',
    reception: '01300-321343',
    image:     'ut.png',
    doctors: [
      { name: '👨‍⚕️ এ.কে. জিলুল হক',           id: 'jillu'       },
      { name: '👨‍⚕️ মোঃ আরিফুজ্জামান (পলাশ)',   id: 'arifpolash'  },
      { name: '👨‍⚕️ আব্দুল মোকাদ্দেম মাসুদ',    id: 'mmasud'      },
      { name: '👨‍⚕️ সাহেদ আহমেদ সুমন',          id: 'sam'         },
      { name: '👨‍⚕️ সব্যসাচী পাল তমাল',         id: 'stomal'      },
      { name: '👨‍⚕️ মোহাম্মদ হুমায়ুন কবীর',     id: 'humayun'     },
      { name: '👨‍⚕️ অমৃত লাল দাস',              id: 'omrito'      },
      { name: '👨‍⚕️ সাকির আহমদ শাহীন',          id: 'sakirsahin'  },
      { name: '👨‍⚕️ মোঃ ফয়সল আহমেদ',           id: 'mdfoysol'    },
      { name: '👨‍⚕️ সুদীপ্ত ধর শাওন',           id: 'sudiptosawn' },
      { name: '👨‍⚕️ রিয়াজুল জান্নাত মাসুম',     id: 'rjmasum'     },
    ],
  },

  // ── Sylhet ───────────────────────────────────────────────────

  Demo: {
    label:     'ASMS',
    reception: '01755421318',
    image:     'asms.png',                   // replace with actual image when available
    doctors: [
      { name: '👩‍⚕️ রীতা রায়',      id: 'rita_ray'        },
      { name: '👨‍⚕️ মোঃ খালেদুর রহমান চৌধুরী',       id: 'khaled_chy'         },
      { name: '👨‍⚕️ আব্দুল্লাহ জাকি বিন হোসেন',     id: 'jakibinhosen'      },
     
    ],
  },

};

// ── Helpers ───────────────────────────────────────────────────

/** Strip the " H" / " P" suffix from serial labels. e.g. "15 H" → "15" */
function cleanSerial(serial) {
  if (typeof serial === 'string') return serial.replace(/ [HP]$/, '');
  return serial;
}

/** Send appointment data to Google Sheets (fire-and-forget, no-cors). */
async function logToSheet({ phone, age, doctorName, institute, location }) {
  const body = new URLSearchParams({ phone, age, doctor: doctorName, institute, location });
  await fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body });
}

// ── Component ─────────────────────────────────────────────────

const App = () => {

  // Two-level selection
  const [location,       setLocation]       = React.useState('MB');
  const [institute,      setInstitute]      = React.useState('Modern');

  // Form fields
  const [patientName,    setPatientName]    = React.useState('');
  const [patientAge,     setPatientAge]     = React.useState('');
  const [phoneNumber,    setPhoneNumber]    = React.useState('');
  const [selectedDoctor, setSelectedDoctor] = React.useState('');
  const [selectedSerial, setSelectedSerial] = React.useState(null);
  const [attendTime,     setAttendTime]     = React.useState('');

  // UI feedback
  const [output,  setOutput]  = React.useState(null);   // { data } | { error }
  const [saving,  setSaving]  = React.useState(false);
  const [copyMsg, setCopyMsg] = React.useState('');

  // ── Tab change handlers ──────────────────────────────────────

  const handleLocationChange = (loc) => {
    const firstInst = LOCATION_INSTITUTES[loc][0];
    setLocation(loc);
    setInstitute(firstInst);
    setSelectedDoctor('');
    setOutput(null);
  };

  const handleInstituteChange = (inst) => {
    setInstitute(inst);
    setSelectedDoctor('');
    setOutput(null);
  };

  // ── Form handlers ────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!patientName || !patientAge || !phoneNumber || !selectedDoctor || !selectedSerial || !attendTime) {
      setOutput({ error: 'Please fill in all required fields.' });
      return;
    }

    const inst       = INSTITUTES[institute];
    const doctorName = inst.doctors.find(d => d.id === selectedDoctor)?.name ?? 'N/A';

    setOutput({
      data: { name: patientName, doctor: doctorName, serial: cleanSerial(selectedSerial), attendTime, phone: phoneNumber, age: patientAge }
    });

    try {
      setSaving(true);
      await logToSheet({ phone: phoneNumber, age: patientAge, doctorName, institute, location });
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
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.focus(); el.select();
    try   { document.execCommand('copy'); setCopyMsg('✓ Copied to clipboard!'); }
    catch { setCopyMsg('Copy failed — please copy manually.'); }
    document.body.removeChild(el);
    setTimeout(() => setCopyMsg(''), 3000);
  };

  const handleClear = () => {
    setPatientName(''); setPatientAge(''); setPhoneNumber('');
    setSelectedDoctor(''); setSelectedSerial(null); setAttendTime('');
    setOutput(null); setCopyMsg('');
  };

  // ── Derived ──────────────────────────────────────────────────

  const currentInst   = INSTITUTES[institute];
  const instKeysInLoc = LOCATION_INSTITUTES[location];

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="card">

      {/* Header */}
      <h1 className="page-title">🏥 Medical Appointment</h1>

      {/* Location tabs — parent level */}
      <p className="tab-group-label">Location</p>
      <div className="tab-bar tab-bar--location">
        {LOCATIONS.map(loc => (
          <label key={loc} className={location === loc ? 'active' : ''}>
            <input type="radio" name="location" value={loc}
              checked={location === loc} onChange={() => handleLocationChange(loc)} />
            {LOCATION_META[loc].label}
          </label>
        ))}
      </div>

      {/* Institute tabs — child level */}
      <p className="tab-group-label">Institute</p>
      <div className="tab-bar tab-bar--institute">
        {instKeysInLoc.map(inst => (
          <label key={inst} className={institute === inst ? 'active' : ''}>
            <input type="radio" name="institute" value={inst}
              checked={institute === inst} onChange={() => handleInstituteChange(inst)} />
            {INSTITUTES[inst].label}
          </label>
        ))}
      </div>

      {/* Reception number */}
      <div className="reception-banner">
        {currentInst.label} Reception: {currentInst.reception}
      </div>

      {/* Hospital image */}
      <img src={currentInst.image} alt={`${currentInst.label} hospital`} className="hospital-img"
        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x160/cccccc/555555?text=Image+Unavailable'; }} />

      {/* Form */}
      <div className="form-group">
        <input type="text"   placeholder="Patient Name"              value={patientName}  onChange={e => setPatientName(e.target.value)}  className="field" />
        <input type="number" placeholder="Patient Age"   min="0"     value={patientAge}   onChange={e => setPatientAge(e.target.value)}   className="field" />
        <input type="tel"    placeholder="Phone Number"              value={phoneNumber}  onChange={e => setPhoneNumber(e.target.value)}  className="field" />

        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="field">
          <option value="" disabled>Select Doctor</option>
          {currentInst.doctors.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>

        <div>
          <p className="serial-label">Select Serial Number</p>
          <div className="serial-grid">
            {SERIAL_NUMBERS.map(serial => (
              <button key={serial} onClick={() => setSelectedSerial(serial)}
                className={`serial-btn${selectedSerial === serial ? ' selected' : ''}`}>
                {serial}
              </button>
            ))}
          </div>
        </div>

        <input type="text" placeholder="Attend Time (e.g. 10:30 AM)" value={attendTime}
          onChange={e => setAttendTime(e.target.value)} className="field" />
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} className="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Generate Appointment'}
      </button>

      {/* Output */}
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
