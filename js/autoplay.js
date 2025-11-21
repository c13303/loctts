(function () {
    const API_BASE = window.AUTOPLAY_API_BASE || '/api';
    const DEFAULT_VOICE = 'en';

    const absoluteUrl = (url) => {
        try {
            return new URL(url, window.location.origin).toString();
        } catch (e) {
            return url;
        }
    };

    async function synthesize(text) {
        const res = await fetch(`${API_BASE}/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice: DEFAULT_VOICE, effects: {} })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success || !data.audioUrl) throw new Error(data.error || 'No audio URL');
        return absoluteUrl(data.audioUrl);
    }

    function bindAutoplayButton() {
        const $btn = $('#autoplay-test');
        if (!$btn.length) return;

        const params = new URLSearchParams(window.location.search);
        const resolvedText = (params.get('text') || params.get('autoplaytext') || params.get('autoplayText') || $btn.data('text') || 'Autoplay test').trim();

        let audioEl = null;
        let ready = false;
        let loading = false;

        const setLabel = (label) => $btn.text(label);

        const prepare = async () => {
            if (loading) return;
            loading = true;
            ready = false;
            setLabel('Generating...');
            try {
                const audioUrl = await synthesize(resolvedText);
                audioEl = new Audio(audioUrl);
                audioEl.crossOrigin = 'anonymous';
                audioEl.addEventListener('canplaythrough', () => setLabel('Play (ready)'), { once: true });
                ready = true;
            } catch (err) {
                console.error('Autoplay synth error:', err);
                setLabel('Error (retry)');
            } finally {
                loading = false;
            }
        };

        const play = () => {
            if (!audioEl) return;
            setLabel('Playing...');
            audioEl.play().catch(err => {
                console.warn('Autoplay blocked:', err);
                setLabel('Play (ready)');
            });
        };

        $btn.on('click', async () => {
            if (!ready) {
                await prepare();
                if (!ready) return;
            }
            play();
        });

        // auto-prepare on load so the audio is ready when the user clicks
        prepare();
    }

    $(document).ready(bindAutoplayButton);
})(); 
