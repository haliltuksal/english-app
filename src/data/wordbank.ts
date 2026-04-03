import { bulkInsertWords, getWordCount } from '../db/word-queries';

export interface WordBankEntry {
  word: string;
  translation: string;
  category: string;
  difficulty: string;
}

export const wordBank: WordBankEntry[] = [
  // ============================================================
  // A2 - Basic everyday + simple work words (40 words)
  // ============================================================

  // everyday
  { word: 'hello', translation: 'merhaba', category: 'everyday', difficulty: 'A2' },
  { word: 'goodbye', translation: 'hoşça kal', category: 'everyday', difficulty: 'A2' },
  { word: 'thank you', translation: 'teşekkür ederim', category: 'everyday', difficulty: 'A2' },
  { word: 'please', translation: 'lütfen', category: 'everyday', difficulty: 'A2' },
  { word: 'sorry', translation: 'özür dilerim', category: 'everyday', difficulty: 'A2' },
  { word: 'understand', translation: 'anlamak', category: 'everyday', difficulty: 'A2' },
  { word: 'explain', translation: 'açıklamak', category: 'everyday', difficulty: 'A2' },
  { word: 'problem', translation: 'sorun', category: 'everyday', difficulty: 'A2' },
  { word: 'question', translation: 'soru', category: 'everyday', difficulty: 'A2' },
  { word: 'answer', translation: 'cevap', category: 'everyday', difficulty: 'A2' },
  { word: 'help', translation: 'yardım', category: 'everyday', difficulty: 'A2' },
  { word: 'important', translation: 'önemli', category: 'everyday', difficulty: 'A2' },
  { word: 'different', translation: 'farklı', category: 'everyday', difficulty: 'A2' },
  { word: 'together', translation: 'birlikte', category: 'everyday', difficulty: 'A2' },
  { word: 'already', translation: 'zaten', category: 'everyday', difficulty: 'A2' },
  { word: 'actually', translation: 'aslında', category: 'everyday', difficulty: 'A2' },
  { word: 'again', translation: 'tekrar', category: 'everyday', difficulty: 'A2' },
  { word: 'maybe', translation: 'belki', category: 'everyday', difficulty: 'A2' },
  { word: 'usually', translation: 'genellikle', category: 'everyday', difficulty: 'A2' },
  { word: 'agree', translation: 'katılmak / hemfikir olmak', category: 'everyday', difficulty: 'A2' },

  // work
  { word: 'meeting', translation: 'toplantı', category: 'work', difficulty: 'A2' },
  { word: 'email', translation: 'e-posta', category: 'work', difficulty: 'A2' },
  { word: 'schedule', translation: 'program / takvim', category: 'work', difficulty: 'A2' },
  { word: 'task', translation: 'görev', category: 'work', difficulty: 'A2' },
  { word: 'team', translation: 'takım / ekip', category: 'work', difficulty: 'A2' },
  { word: 'project', translation: 'proje', category: 'work', difficulty: 'A2' },
  { word: 'computer', translation: 'bilgisayar', category: 'work', difficulty: 'A2' },
  { word: 'internet', translation: 'internet', category: 'work', difficulty: 'A2' },
  { word: 'office', translation: 'ofis', category: 'work', difficulty: 'A2' },
  { word: 'report', translation: 'rapor', category: 'work', difficulty: 'A2' },
  { word: 'manager', translation: 'yönetici', category: 'work', difficulty: 'A2' },
  { word: 'finish', translation: 'bitirmek', category: 'work', difficulty: 'A2' },
  { word: 'start', translation: 'başlamak', category: 'work', difficulty: 'A2' },
  { word: 'ready', translation: 'hazır', category: 'work', difficulty: 'A2' },
  { word: 'available', translation: 'müsait / mevcut', category: 'work', difficulty: 'A2' },
  { word: 'busy', translation: 'meşgul', category: 'work', difficulty: 'A2' },
  { word: 'share', translation: 'paylaşmak', category: 'work', difficulty: 'A2' },
  { word: 'update', translation: 'güncelleme / güncellemek', category: 'work', difficulty: 'A2' },
  { word: 'send', translation: 'göndermek', category: 'work', difficulty: 'A2' },
  { word: 'check', translation: 'kontrol etmek', category: 'work', difficulty: 'A2' },

  // ============================================================
  // B1 - Intermediate work + tech words (40 words)
  // ============================================================

  // work
  { word: 'deadline', translation: 'son teslim tarihi', category: 'work', difficulty: 'B1' },
  { word: 'feedback', translation: 'geri bildirim', category: 'work', difficulty: 'B1' },
  { word: 'approve', translation: 'onaylamak', category: 'work', difficulty: 'B1' },
  { word: 'assign', translation: 'atamak / görevlendirmek', category: 'work', difficulty: 'B1' },
  { word: 'estimate', translation: 'tahmin / tahmin etmek', category: 'work', difficulty: 'B1' },
  { word: 'priority', translation: 'öncelik', category: 'work', difficulty: 'B1' },
  { word: 'progress', translation: 'ilerleme', category: 'work', difficulty: 'B1' },
  { word: 'responsible', translation: 'sorumlu', category: 'work', difficulty: 'B1' },
  { word: 'collaborate', translation: 'iş birliği yapmak', category: 'work', difficulty: 'B1' },
  { word: 'requirement', translation: 'gereksinim', category: 'work', difficulty: 'B1' },
  { word: 'achieve', translation: 'başarmak', category: 'work', difficulty: 'B1' },
  { word: 'maintain', translation: 'sürdürmek / bakım yapmak', category: 'work', difficulty: 'B1' },
  { word: 'resolve', translation: 'çözmek', category: 'work', difficulty: 'B1' },
  { word: 'deliver', translation: 'teslim etmek', category: 'work', difficulty: 'B1' },

  // tech
  { word: 'feature', translation: 'özellik', category: 'tech', difficulty: 'B1' },
  { word: 'deploy', translation: 'yayına almak / dağıtmak', category: 'tech', difficulty: 'B1' },
  { word: 'implement', translation: 'uygulamak / geliştirmek', category: 'tech', difficulty: 'B1' },
  { word: 'review', translation: 'incelemek / gözden geçirmek', category: 'tech', difficulty: 'B1' },
  { word: 'debug', translation: 'hata ayıklamak', category: 'tech', difficulty: 'B1' },
  { word: 'release', translation: 'sürüm / yayınlamak', category: 'tech', difficulty: 'B1' },
  { word: 'branch', translation: 'dal / dallanmak', category: 'tech', difficulty: 'B1' },
  { word: 'commit', translation: 'işlemek / kaydetmek', category: 'tech', difficulty: 'B1' },
  { word: 'merge', translation: 'birleştirmek', category: 'tech', difficulty: 'B1' },
  { word: 'crash', translation: 'çökmek', category: 'tech', difficulty: 'B1' },
  { word: 'backend', translation: 'arka uç', category: 'tech', difficulty: 'B1' },
  { word: 'frontend', translation: 'ön yüz', category: 'tech', difficulty: 'B1' },
  { word: 'database', translation: 'veritabanı', category: 'tech', difficulty: 'B1' },
  { word: 'framework', translation: 'çatı / iskelet', category: 'tech', difficulty: 'B1' },

  // everyday
  { word: 'apparently', translation: 'görünüşe göre / anlaşılan', category: 'everyday', difficulty: 'B1' },
  { word: 'recommend', translation: 'tavsiye etmek / önermek', category: 'everyday', difficulty: 'B1' },
  { word: 'suggest', translation: 'önermek', category: 'everyday', difficulty: 'B1' },
  { word: 'improve', translation: 'geliştirmek / iyileştirmek', category: 'everyday', difficulty: 'B1' },
  { word: 'consider', translation: 'düşünmek / göz önünde bulundurmak', category: 'everyday', difficulty: 'B1' },
  { word: 'convenient', translation: 'uygun / elverişli', category: 'everyday', difficulty: 'B1' },
  { word: 'efficient', translation: 'verimli', category: 'everyday', difficulty: 'B1' },
  { word: 'currently', translation: 'şu anda', category: 'everyday', difficulty: 'B1' },
  { word: 'obviously', translation: 'açıkça / belli ki', category: 'everyday', difficulty: 'B1' },
  { word: 'therefore', translation: 'bu yüzden / dolayısıyla', category: 'everyday', difficulty: 'B1' },
  { word: 'meanwhile', translation: 'bu arada', category: 'everyday', difficulty: 'B1' },
  { word: 'mention', translation: 'bahsetmek', category: 'everyday', difficulty: 'B1' },

  // ============================================================
  // B2 - Upper-intermediate professional + technical (40 words)
  // ============================================================

  // tech
  { word: 'architecture', translation: 'mimari', category: 'tech', difficulty: 'B2' },
  { word: 'scalable', translation: 'ölçeklenebilir', category: 'tech', difficulty: 'B2' },
  { word: 'middleware', translation: 'ara yazılım / ara katman', category: 'tech', difficulty: 'B2' },
  { word: 'deprecated', translation: 'kullanımdan kaldırılmış', category: 'tech', difficulty: 'B2' },
  { word: 'refactor', translation: 'yeniden düzenlemek', category: 'tech', difficulty: 'B2' },
  { word: 'repository', translation: 'depo / kod deposu', category: 'tech', difficulty: 'B2' },
  { word: 'asynchronous', translation: 'eşzamansız', category: 'tech', difficulty: 'B2' },
  { word: 'authentication', translation: 'kimlik doğrulama', category: 'tech', difficulty: 'B2' },
  { word: 'endpoint', translation: 'uç nokta', category: 'tech', difficulty: 'B2' },
  { word: 'abstraction', translation: 'soyutlama', category: 'tech', difficulty: 'B2' },
  { word: 'throughput', translation: 'işlem hacmi / verim', category: 'tech', difficulty: 'B2' },
  { word: 'latency', translation: 'gecikme süresi', category: 'tech', difficulty: 'B2' },
  { word: 'payload', translation: 'veri yükü', category: 'tech', difficulty: 'B2' },
  { word: 'boilerplate', translation: 'şablon kod / kalıp', category: 'tech', difficulty: 'B2' },

  // work
  { word: 'iterate', translation: 'tekrarlamak / yinelemek', category: 'work', difficulty: 'B2' },
  { word: 'stakeholder', translation: 'paydaş', category: 'work', difficulty: 'B2' },
  { word: 'bottleneck', translation: 'darboğaz', category: 'work', difficulty: 'B2' },
  { word: 'bandwidth', translation: 'bant genişliği / kapasitesi', category: 'work', difficulty: 'B2' },
  { word: 'leverage', translation: 'kaldıraç / faydalanmak', category: 'work', difficulty: 'B2' },
  { word: 'streamline', translation: 'sadeleştirmek / verimli hale getirmek', category: 'work', difficulty: 'B2' },
  { word: 'delegate', translation: 'delege etmek / yetki devretmek', category: 'work', difficulty: 'B2' },
  { word: 'proactive', translation: 'proaktif / önceden harekete geçen', category: 'work', difficulty: 'B2' },
  { word: 'feasible', translation: 'uygulanabilir / yapılabilir', category: 'work', difficulty: 'B2' },
  { word: 'benchmark', translation: 'kıyaslama / referans noktası', category: 'work', difficulty: 'B2' },
  { word: 'scope', translation: 'kapsam', category: 'work', difficulty: 'B2' },
  { word: 'constraint', translation: 'kısıtlama', category: 'work', difficulty: 'B2' },

  // academic
  { word: 'significant', translation: 'önemli / anlamlı', category: 'academic', difficulty: 'B2' },
  { word: 'consequently', translation: 'sonuç olarak', category: 'academic', difficulty: 'B2' },
  { word: 'fundamental', translation: 'temel', category: 'academic', difficulty: 'B2' },
  { word: 'demonstrate', translation: 'göstermek / kanıtlamak', category: 'academic', difficulty: 'B2' },
  { word: 'assumption', translation: 'varsayım', category: 'academic', difficulty: 'B2' },
  { word: 'relevant', translation: 'ilgili / alakalı', category: 'academic', difficulty: 'B2' },
  { word: 'inevitable', translation: 'kaçınılmaz', category: 'academic', difficulty: 'B2' },
  { word: 'perspective', translation: 'bakış açısı', category: 'academic', difficulty: 'B2' },
  { word: 'adequate', translation: 'yeterli', category: 'academic', difficulty: 'B2' },
  { word: 'emphasize', translation: 'vurgulamak', category: 'academic', difficulty: 'B2' },
  { word: 'consistent', translation: 'tutarlı', category: 'academic', difficulty: 'B2' },
  { word: 'evaluate', translation: 'değerlendirmek', category: 'academic', difficulty: 'B2' },
  { word: 'encounter', translation: 'karşılaşmak', category: 'academic', difficulty: 'B2' },
  { word: 'substantial', translation: 'önemli / kayda değer', category: 'academic', difficulty: 'B2' },

  // ============================================================
  // C1 - Advanced academic + professional (40 words)
  // ============================================================

  // academic
  { word: 'ubiquitous', translation: 'her yerde bulunan / yaygın', category: 'academic', difficulty: 'C1' },
  { word: 'paradigm', translation: 'paradigma / model', category: 'academic', difficulty: 'C1' },
  { word: 'meticulous', translation: 'titiz / dikkatli', category: 'academic', difficulty: 'C1' },
  { word: 'comprehensive', translation: 'kapsamlı', category: 'academic', difficulty: 'C1' },
  { word: 'pragmatic', translation: 'pragmatik / faydacı', category: 'academic', difficulty: 'C1' },
  { word: 'eloquent', translation: 'belagatlı / akıcı konuşan', category: 'academic', difficulty: 'C1' },
  { word: 'substantiate', translation: 'kanıtlamak / desteklemek', category: 'academic', difficulty: 'C1' },
  { word: 'nuanced', translation: 'ince ayrıntılı / nüanslı', category: 'academic', difficulty: 'C1' },
  { word: 'ambiguous', translation: 'belirsiz / çok anlamlı', category: 'academic', difficulty: 'C1' },
  { word: 'articulate', translation: 'açıkça ifade etmek', category: 'academic', difficulty: 'C1' },
  { word: 'convoluted', translation: 'karmaşık / dolambaçlı', category: 'academic', difficulty: 'C1' },
  { word: 'corroborate', translation: 'doğrulamak / desteklemek', category: 'academic', difficulty: 'C1' },
  { word: 'discrepancy', translation: 'tutarsızlık / uyuşmazlık', category: 'academic', difficulty: 'C1' },
  { word: 'elaborate', translation: 'ayrıntılı açıklamak / detaylandırmak', category: 'academic', difficulty: 'C1' },
  { word: 'proliferate', translation: 'hızla çoğalmak / yayılmak', category: 'academic', difficulty: 'C1' },
  { word: 'scrutinize', translation: 'dikkatle incelemek', category: 'academic', difficulty: 'C1' },

  // work
  { word: 'mitigate', translation: 'hafifletmek / azaltmak', category: 'work', difficulty: 'C1' },
  { word: 'expedite', translation: 'hızlandırmak', category: 'work', difficulty: 'C1' },
  { word: 'alleviate', translation: 'hafifletmek / rahatlatmak', category: 'work', difficulty: 'C1' },
  { word: 'circumvent', translation: 'atlatmak / etrafından dolanmak', category: 'work', difficulty: 'C1' },
  { word: 'deteriorate', translation: 'kötüleşmek / bozulmak', category: 'work', difficulty: 'C1' },
  { word: 'exacerbate', translation: 'kötüleştirmek / şiddetlendirmek', category: 'work', difficulty: 'C1' },
  { word: 'consolidate', translation: 'birleştirmek / pekiştirmek', category: 'work', difficulty: 'C1' },
  { word: 'predominant', translation: 'baskın / ağırlıklı', category: 'work', difficulty: 'C1' },
  { word: 'preliminary', translation: 'ön / başlangıç niteliğinde', category: 'work', difficulty: 'C1' },
  { word: 'unprecedented', translation: 'benzeri görülmemiş / emsalsiz', category: 'work', difficulty: 'C1' },
  { word: 'contingency', translation: 'olasılık / acil durum planı', category: 'work', difficulty: 'C1' },
  { word: 'autonomous', translation: 'özerk / bağımsız', category: 'work', difficulty: 'C1' },

  // tech
  { word: 'deterministic', translation: 'belirlenimci / öngörülebilir', category: 'tech', difficulty: 'C1' },
  { word: 'idempotent', translation: 'etkisiz / aynı sonucu veren', category: 'tech', difficulty: 'C1' },
  { word: 'polymorphism', translation: 'çok biçimlilik', category: 'tech', difficulty: 'C1' },
  { word: 'concurrency', translation: 'eşzamanlılık', category: 'tech', difficulty: 'C1' },
  { word: 'immutable', translation: 'değişmez / değiştirilemez', category: 'tech', difficulty: 'C1' },
  { word: 'encapsulation', translation: 'kapsülleme / sarmalama', category: 'tech', difficulty: 'C1' },
  { word: 'interoperability', translation: 'birlikte çalışabilirlik', category: 'tech', difficulty: 'C1' },
  { word: 'redundancy', translation: 'yedeklilik / fazlalık', category: 'tech', difficulty: 'C1' },
  { word: 'orchestrate', translation: 'düzenlemek / yönetmek', category: 'tech', difficulty: 'C1' },
  { word: 'propagate', translation: 'yaymak / iletmek', category: 'tech', difficulty: 'C1' },
  { word: 'recursive', translation: 'özyinelemeli', category: 'tech', difficulty: 'C1' },
  { word: 'volatile', translation: 'değişken / kararsız', category: 'tech', difficulty: 'C1' },

  // ============================================================
  // C2 - Mastery level: rare, literary, idiomatic (40 words)
  // ============================================================

  // academic
  { word: 'serendipity', translation: 'şans eseri güzel bir keşif', category: 'academic', difficulty: 'C2' },
  { word: 'ephemeral', translation: 'geçici / kısa ömürlü', category: 'academic', difficulty: 'C2' },
  { word: 'quintessential', translation: 'mükemmel örnek / özünü temsil eden', category: 'academic', difficulty: 'C2' },
  { word: 'juxtapose', translation: 'yan yana koymak / karşılaştırmak', category: 'academic', difficulty: 'C2' },
  { word: 'idiosyncratic', translation: 'kendine özgü / alışılmadık', category: 'academic', difficulty: 'C2' },
  { word: 'albeit', translation: 'her ne kadar / gerçi', category: 'academic', difficulty: 'C2' },
  { word: 'notwithstanding', translation: 'buna rağmen / -e rağmen', category: 'academic', difficulty: 'C2' },
  { word: 'unequivocal', translation: 'kesin / açık / tartışmasız', category: 'academic', difficulty: 'C2' },
  { word: 'conundrum', translation: 'çözülmesi güç sorun / ikilem', category: 'academic', difficulty: 'C2' },
  { word: 'penchant', translation: 'eğilim / düşkünlük', category: 'academic', difficulty: 'C2' },
  { word: 'sycophant', translation: 'dalkavuk / yağcı', category: 'academic', difficulty: 'C2' },
  { word: 'vicissitude', translation: 'değişkenlik / iniş çıkış', category: 'academic', difficulty: 'C2' },
  { word: 'recalcitrant', translation: 'inatçı / asi / söz dinlemez', category: 'academic', difficulty: 'C2' },
  { word: 'obfuscate', translation: 'karmaşıklaştırmak / bulandırmak', category: 'academic', difficulty: 'C2' },
  { word: 'perfunctory', translation: 'yarım yamalak / gelişigüzel', category: 'academic', difficulty: 'C2' },
  { word: 'surreptitious', translation: 'gizli / el altından yapılan', category: 'academic', difficulty: 'C2' },
  { word: 'ineffable', translation: 'tarif edilemez / anlatılamaz', category: 'academic', difficulty: 'C2' },
  { word: 'superfluous', translation: 'gereksiz / fazlalık', category: 'academic', difficulty: 'C2' },
  { word: 'antithesis', translation: 'zıt / karşıtlık', category: 'academic', difficulty: 'C2' },
  { word: 'magnanimous', translation: 'cömert / yüce gönüllü', category: 'academic', difficulty: 'C2' },
  { word: 'ostentatious', translation: 'gösterişli / gösteriş meraklısı', category: 'academic', difficulty: 'C2' },
  { word: 'propensity', translation: 'eğilim / meyil', category: 'academic', difficulty: 'C2' },
  { word: 'acquiesce', translation: 'ses çıkarmadan kabul etmek', category: 'academic', difficulty: 'C2' },
  { word: 'dichotomy', translation: 'ikilik / ikiye bölünme', category: 'academic', difficulty: 'C2' },

  // expressions
  { word: 'to cut corners', translation: 'işi kolaya kaçmak', category: 'expressions', difficulty: 'C2' },
  { word: 'to go the extra mile', translation: 'ekstra çaba göstermek', category: 'expressions', difficulty: 'C2' },
  { word: 'back to square one', translation: 'başa dönmek / yeniden başlamak', category: 'expressions', difficulty: 'C2' },
  { word: 'a ballpark figure', translation: 'yaklaşık rakam / kabaca tahmin', category: 'expressions', difficulty: 'C2' },
  { word: 'to be on the same page', translation: 'aynı fikirde olmak / hemfikir olmak', category: 'expressions', difficulty: 'C2' },
  { word: 'to hit the ground running', translation: 'hemen işe koyulmak', category: 'expressions', difficulty: 'C2' },
  { word: 'the elephant in the room', translation: 'herkesin bildiği ama konuşmadığı sorun', category: 'expressions', difficulty: 'C2' },
  { word: 'to bite the bullet', translation: 'gözünü karartmak / zor olanı kabullenmek', category: 'expressions', difficulty: 'C2' },
  { word: 'to burn the midnight oil', translation: 'gece geç saatlere kadar çalışmak', category: 'expressions', difficulty: 'C2' },
  { word: 'a double-edged sword', translation: 'iki ucu keskin bıçak', category: 'expressions', difficulty: 'C2' },
  { word: 'the last straw', translation: 'bardağı taşıran son damla', category: 'expressions', difficulty: 'C2' },
  { word: 'to think outside the box', translation: 'kalıpların dışında düşünmek', category: 'expressions', difficulty: 'C2' },
  { word: 'in a nutshell', translation: 'özetle / kısaca', category: 'expressions', difficulty: 'C2' },
  { word: 'to play devil\'s advocate', translation: 'karşı tarafı savunmak (tartışma uğruna)', category: 'expressions', difficulty: 'C2' },
  { word: 'a steep learning curve', translation: 'öğrenmesi zor olan süreç', category: 'expressions', difficulty: 'C2' },
  { word: 'to pull the plug', translation: 'fişini çekmek / iptal etmek', category: 'expressions', difficulty: 'C2' },
];

export async function seedWordBank(): Promise<void> {
  const count = await getWordCount();
  if (count > 0) return; // Already seeded
  await bulkInsertWords(wordBank);
}
