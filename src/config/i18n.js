const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

i18next
    .use(Backend)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        preload: ['en', 'fr'],
        backend: {
            loadPath: './src/locales/{{lng}}/{{ns}}.json'
        },
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['header', 'querystring'],
            lookupHeader: 'accept-language',
            lookupQuerystring: 'lang',
            caches: false
        }
    });

const i18n = (req, res, next) => {
    req.t = i18next.getFixedT(req.headers['accept-language'] || 'en');
    next();
};

module.exports = { i18n, i18next };
