const DEFAULTS = {enabled: false, position: 'bottom', size: 1, contrast: 'adaptive'};
const toggle = document.querySelector('#toggle');
const status = document.querySelector('#status');
const controls = ['position', 'size', 'contrast'];
let tabId;

function setStatus(text) { status.textContent = text; }

function sendToTab(message) {
  return new Promise((resolve, reject) => chrome.tabs.sendMessage(tabId, message, response => {
    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
    else resolve(response);
  }));
}

async function warmTranslatorFromGesture() {
  if (typeof Translator === 'undefined') throw new Error('API_UNSUPPORTED');
  // Call create directly during this click's activation; awaiting availability
  // first can consume Chrome's transient user gesture before model download.
  setStatus('Đang kiểm tra mô hình dịch trên thiết bị…');
  const translator = await Translator.create({sourceLanguage: 'en', targetLanguage: 'vi', monitor(monitor) {
    monitor.addEventListener('downloadprogress', event => {
      setStatus(`Đang tải mô hình dịch… ${Math.round(event.loaded * 100)}%`);
    });
  }});
  translator.destroy();
}

async function updateToggle(enabled) {
  toggle.disabled = true;
  try {
    if (enabled) {
      let warmError;
      try { await warmTranslatorFromGesture(); } catch (error) { warmError = error; }
      await sendToTab({type: 'BILINGUAL_TOGGLE', enabled: true});
      setStatus(warmError
        ? 'Đã bật lớp phủ. ' + (warmError.message === 'API_UNSUPPORTED' || warmError.name === 'NotSupportedError'
          ? 'Chrome không hỗ trợ dịch EN → VI; câu nguồn vẫn hiển thị.'
          : 'Nếu cần tải mô hình, hãy khởi tạo từ nút trong video.')
        : 'Đã bật. Chọn track tiếng Anh trong YouTube; caption gốc sẽ được ẩn.');
    } else {
      await sendToTab({type: 'BILINGUAL_TOGGLE', enabled: false});
      setStatus('Đã tắt lớp phủ song ngữ.');
    }
    await chrome.storage.sync.set({enabled});
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? 'Tắt phụ đề song ngữ' : 'Bật phụ đề song ngữ';
  } catch (error) {
    const message = error.message || 'Không thể cập nhật tab. Hãy mở video YouTube.';
    setStatus(message);
    if (enabled) {
      await chrome.storage.sync.set({enabled: false});
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = 'Bật phụ đề song ngữ';
    }
  } finally { toggle.disabled = false; }
}

chrome.tabs.query({active: true, currentWindow: true}, async ([tab]) => {
  tabId = tab?.id;
  const supportedTab = /^https:\/\/www\.youtube\.com\/watch/.test(tab?.url || '');
  const values = await chrome.storage.sync.get(DEFAULTS);
  for (const key of controls) document.querySelector(`#${key}`).value = String(values[key]);
  toggle.disabled = !supportedTab;
  if (!supportedTab) setStatus('Mở trang xem video YouTube để sử dụng.');
  toggle.setAttribute('aria-pressed', String(Boolean(values.enabled)));
  toggle.textContent = values.enabled ? 'Tắt phụ đề song ngữ' : 'Bật phụ đề song ngữ';
});

toggle.addEventListener('click', () => updateToggle(toggle.getAttribute('aria-pressed') !== 'true'));
for (const key of controls) document.querySelector(`#${key}`).addEventListener('change', async event => {
  const value = key === 'size' ? Number(event.target.value) : event.target.value;
  await chrome.storage.sync.set({[key]: value});
});
