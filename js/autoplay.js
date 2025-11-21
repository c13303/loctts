(function () {
    const params = new URLSearchParams(window.location.search);
    const autoText = params.get('autoplaytext') || params.get('autoplayText');
    if (!autoText) return; // pas d’autoplay demandé

    let shouldAutoplay = true;

    $(document).ready(function () {
        // Pré-remplir le champ texte
        const $text = $('#text');
        if ($text.length) $text.val(autoText);

        // Quand l’audio est prêt, tenter de jouer automatiquement
        $('#audio').one('loadeddata', function () {
            if (!shouldAutoplay) return;
            this.play().catch(err => {
                console.warn('Autoplay bloqué par le navigateur:', err);
            });
        });

        // Déclencher la synthèse après init des handlers
        setTimeout(() => {
            const $btn = $('#synthesize');
            if ($btn.length) $btn.trigger('click');
        }, 300);
    });
})();
