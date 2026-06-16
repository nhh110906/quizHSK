import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

const DECK_META = [
  { level: 1, id: 'hsk-1', name: 'HSK I', nameVi: 'HSK I - Sơ cấp', desc: 'Từ vựng tiếng Trung sơ cấp (~150 từ)' },
  { level: 2, id: 'hsk-2', name: 'HSK II', nameVi: 'HSK II - Sơ trung cấp', desc: 'Từ vựng tiếng Trung sơ trung cấp (~300 từ)' },
  { level: 3, id: 'hsk-3', name: 'HSK III', nameVi: 'HSK III - Trung cấp', desc: 'Từ vựng tiếng Trung trung cấp (~600 từ)' },
  { level: 4, id: 'hsk-4', name: 'HSK IV', nameVi: 'HSK IV - Trung cao cấp', desc: 'Từ vựng tiếng Trung trung cao cấp (~1.200 từ)' },
  { level: 5, id: 'hsk-5', name: 'HSK V', nameVi: 'HSK V - Cao cấp', desc: 'Từ vựng tiếng Trung cao cấp (~2.500 từ)' },
  { level: 6, id: 'hsk-6', name: 'HSK VI', nameVi: 'HSK VI - Thành thạo', desc: 'Từ vựng tiếng Trung thành thạo (~5.000 từ)' },
];

const VI_MAP = {
  '爱': 'yêu, thích', '八': 'số tám', '爸爸': 'bố, cha', '杯子': 'cái cốc', '北京': 'Bắc Kinh',
  '本': 'quyển (lượng từ)', '不': 'không', '不客气': 'không có gì', '菜': 'món ăn, rau',
  '茶': 'trà', '吃': 'ăn', '出租车': 'taxi', '打电话': 'gọi điện', '大': 'to, lớn',
  '的': 'của (trợ từ)', '点': 'điểm, chút', '电脑': 'máy tính', '电视': 'tivi',
  '电影': 'phim', '东西': 'đồ vật', '都': 'đều', '读': 'đọc', '对不起': 'xin lỗi',
  '多': 'nhiều', '多少': 'bao nhiêu', '儿子': 'con trai', '二': 'số hai', '饭店': 'nhà hàng',
  '飞机': 'máy bay', '分钟': 'phút', '高兴': 'vui vẻ', '个': 'cái (lượng từ)', '工作': 'công việc',
  '狗': 'con chó', '汉语': 'tiếng Hán', '好': 'tốt', '号': 'số', '喝': 'uống',
  '和': 'và', '很': 'rất', '后面': 'phía sau', '回': 'về', '会': 'biết, sẽ',
  '几': 'mấy', '家': 'nhà', '叫': 'gọi', '今天': 'hôm nay', '九': 'số chín',
  '开': 'mở, lái', '看': 'xem, nhìn', '看见': 'nhìn thấy', '块': 'đồng (tiền)', '来': 'đến',
  '老师': 'thầy/cô giáo', '了': 'rồi (trợ từ)', '冷': 'lạnh', '里': 'trong', '六': 'số sáu',
  '妈妈': 'mẹ', '吗': 'không (câu hỏi)', '买': 'mua', '猫': 'con mèo', '没关系': 'không sao',
  '没有': 'không có', '米饭': 'cơm', '名字': 'tên', '明天': 'ngày mai', '哪': 'nào',
  '哪儿': 'ở đâu', '那': 'kia', '呢': 'nhỉ (trợ từ)', '能': 'có thể', '你': 'bạn',
  '年': 'năm', '女儿': 'con gái', '朋友': 'bạn bè', '漂亮': 'đẹp', '苹果': 'táo',
  '七': 'số bảy', '钱': 'tiền', '前面': 'phía trước', '请': 'xin mời', '去': 'đi',
  '热': 'nóng', '人': 'người', '认识': 'quen biết', '三': 'số ba', '商店': 'cửa hàng',
  '上': 'trên', '上午': 'buổi sáng', '少': 'ít', '谁': 'ai', '什么': 'cái gì',
  '十': 'số mười', '时候': 'lúc', '是': 'là', '书': 'sách', '水': 'nước',
  '水果': 'trái cây', '睡觉': 'ngủ', '说': 'nói', '四': 'số bốn', '岁': 'tuổi',
  '他': 'anh ấy', '她': 'cô ấy', '太': 'quá', '天气': 'thời tiết', '听': 'nghe',
  '同学': 'bạn học', '喂': 'alo', '我': 'tôi', '我们': 'chúng tôi', '五': 'số năm',
  '喜欢': 'thích', '下': 'dưới', '下午': 'buổi chiều', '下雨': 'mưa', '先生': 'ông, thầy',
  '现在': 'bây giờ', '想': 'muốn, nghĩ', '小': 'nhỏ', '小姐': 'cô', '些': 'một số',
  '写': 'viết', '谢谢': 'cảm ơn', '星期': 'tuần', '学生': 'học sinh', '学习': 'học tập',
  '学校': 'trường học', '一': 'một', '衣服': 'quần áo', '医生': 'bác sĩ', '医院': 'bệnh viện',
  '椅子': 'ghế', '有': 'có', '月': 'tháng', '再见': 'tạm biệt', '在': 'ở',
  '怎么': 'thế nào', '怎么样': 'thế nào', '这': 'này', '中国': 'Trung Quốc', '中午': 'buổi trưa',
  '住': 'ở, sống', '桌子': 'bàn', '字': 'chữ', '昨天': 'hôm qua', '做': 'làm',
  '坐': 'ngồi', '你好': 'xin chào', '谢谢': 'cảm ơn',
};

function toVi(hanzi, en) {
  if (VI_MAP[hanzi]) return VI_MAP[hanzi];
  const first = (en || '').split(/[;,]/)[0].trim();
  return first || hanzi;
}

async function fetchLevel(level) {
  const url = `https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/wordlists/inclusive/old/${level}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch HSK ${level}`);
  return res.json();
}

function transformWord(entry, level, index) {
  const form = entry.forms?.[0] || {};
  const hanzi = entry.simplified || form.traditional || '';
  const pinyin = form.transcriptions?.pinyin || '';
  const en = (form.meanings || []).join('; ').split(';')[0].trim();
  return {
    id: `hsk${level}-${index + 1}`,
    hanzi,
    pinyin,
    meaningEn: en,
    meaningVi: toVi(hanzi, en),
    example: null,
  };
}

async function main() {
  const decks = [];
  for (const meta of DECK_META) {
    console.log(`Building ${meta.name}...`);
    const raw = await fetchLevel(meta.level);
    const words = raw.map((w, i) => transformWord(w, meta.level, i));
    decks.push({
      id: meta.id,
      level: meta.level,
      name: meta.name,
      nameVi: meta.nameVi,
      description: meta.desc,
      wordCount: words.length,
      words,
    });
  }

  const scenarios = [
    { id: 'travel', title: 'Du lịch', titleEn: 'Travel', prompts: [
      { role: 'assistant', text: '你好！欢迎来到餐厅。你想点什么？' },
      { role: 'user_hint', text: 'Dùng từ: 要, 水, 茶' },
    ]},
    { id: 'work', title: 'Công việc', titleEn: 'Work', prompts: [
      { role: 'assistant', text: '你好，请介绍一下你自己。' },
      { role: 'user_hint', text: 'Dùng từ: 名字, 工作, 学习' },
    ]},
    { id: 'daily', title: 'Đời sống hàng ngày', titleEn: 'Daily life', prompts: [
      { role: 'assistant', text: '今天天气怎么样？' },
      { role: 'user_hint', text: 'Dùng từ: 天气, 热, 冷, 很好' },
    ]},
    { id: 'shopping', title: 'Mua sắm', titleEn: 'Shopping', prompts: [
      { role: 'assistant', text: '这个多少钱？' },
      { role: 'user_hint', text: 'Dùng từ: 钱, 块, 买' },
    ]},
  ];

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'decks.json'), JSON.stringify({ decks, scenarios }, null, 0));
  console.log(`Done. ${decks.length} decks, ${decks.reduce((s, d) => s + d.wordCount, 0)} words total.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
