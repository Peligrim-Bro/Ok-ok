// Owner-approved mission and contextual calls to action. No personal signature.
export const BRAND = {
 ru:{motto:'Твой опыт — чья-то безопасная поездка',cta:{rate:'Был здесь? Оцени!',share:'Знаешь хорошее место? Поделись!',warn:'Столкнулся с обманом? Предупреди!'}},
 en:{motto:'Your experience. Someone else’s safer journey.',cta:{rate:'Been here? Rate it!',share:'Found a good place? Share it!',warn:'Encountered a scam? Warn others!'}},
 th:{motto:'ประสบการณ์ของคุณ ช่วยให้คนอื่นเดินทางได้ปลอดภัยขึ้น',cta:{rate:'เคยไปไหม? ให้คะแนนเลย!',share:'รู้จักสถานที่ดี ๆ? แบ่งปัน!',warn:'เจอกลโกง? เตือนคนอื่น!'}}
};
export function brandSignature(kind,lang='ru'){
 const copy=BRAND[lang];
 if(!copy||!Object.hasOwn(copy.cta,kind))throw Error('invalid_channel_branding');
 return copy.cta[kind]+'\n'+copy.motto;
}
