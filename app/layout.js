import './globals.css'
import CopyPatch from './CopyPatch'

export const metadata = {
  title: 'ScoutIQ — Social Intelligence',
  description: 'AI-powered social intelligence and competitor analysis.'
}

const insightSeedScript = `
(function () {
  try {
    var key = 'scoutiq-content-insights';
    var required = [
      { id:'1', business:'Youngdo Clinic', type:'Reel', topic:'Before / After transformation', insight:'Visual proof and a clear transformation hook can stop the scroll faster than generic service posts.', action:'Create 3 proof-led Reels with the result visible in the first 2 seconds.', score:88 },
      { id:'2', business:'inZ Hospital', type:'Review', topic:'Patient review + doctor credibility', insight:'Trust-led content combines customer proof with expert authority.', action:'Pair testimonial clips with one concise doctor explanation and one CTA.', score:82 },
      { id:'3', business:'Lovely Eye & Skin', type:'Offer', topic:'Promotion / offer', insight:'A clear promotional offer makes the value easy to understand and can increase response when paired with strong proof.', action:'Test one focused offer with a single benefit, proof point and clear consultation CTA.', score:80 },
      { id:'4', business:'Beproud Clinic', type:'Expert', topic:'Doctor expertise + consultation trust', insight:'Doctor-led educational content can reduce uncertainty and build trust before a customer decides to contact the clinic.', action:'Create short doctor Q&A Reels around common surgery concerns with a clear consultation CTA.', score:78 }
    ];
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { saved = []; }
    if (!Array.isArray(saved)) saved = [];
    required.forEach(function (item) {
      var exists = saved.some(function (current) {
        return current && current.business === item.business && current.topic === item.topic;
      });
      if (!exists) saved.push(item);
    });
    localStorage.setItem(key, JSON.stringify(saved));
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: insightSeedScript }} />
        {children}
        <CopyPatch />
      </body>
    </html>
  )
}
