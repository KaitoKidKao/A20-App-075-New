export interface Lecture {
  id: string;
  title: string;
  subject: string;
  classGroup: string;
  duration: string;
  status: 'ready' | 'processing' | 'error';
  progress?: number;
  thumbnail?: string;
  uploadedAt: string;
  lecturer: string;
}

export const mockLectures: Lecture[] = [
  {
    id: 'vid-001',
    title: 'Đạo hàm và vi phân — Toán 12',
    subject: 'Toán',
    classGroup: '12A1',
    duration: '45:20',
    status: 'ready',
    uploadedAt: '2026-04-20T08:30:00Z',
    lecturer: 'Thầy Nguyễn Văn A',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop'
  },
  {
    id: 'vid-002',
    title: 'Phương trình hóa học — Hóa 11',
    subject: 'Hóa',
    classGroup: '11B2',
    duration: '38:15',
    status: 'processing',
    progress: 68,
    uploadedAt: '2026-04-22T02:15:00Z',
    lecturer: 'Cô Lê Thị B',
    thumbnail: 'https://images.unsplash.com/photo-1532187875605-1838d737003f?w=400&h=225&fit=crop'
  },
  {
    id: 'vid-003',
    title: 'Văn học hiện đại Việt Nam',
    subject: 'Văn',
    classGroup: '12C3',
    duration: '62:00',
    status: 'ready',
    uploadedAt: '2026-04-19T14:45:00Z',
    lecturer: 'Thầy Trần Đức C',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=225&fit=crop'
  },
  {
    id: 'vid-004',
    title: 'Vật lý lượng tử cơ bản',
    subject: 'Lý',
    classGroup: '12A1',
    duration: '55:00',
    status: 'error',
    uploadedAt: '2026-04-21T09:00:00Z',
    lecturer: 'Thầy Phạm Văn D',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop'
  },
];

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export const mockTranscript: TranscriptSegment[] = [
  { id: '1', startTime: 0, endTime: 10, text: 'Chào mừng các em đến với tiết học Toán ngày hôm nay.' },
  { id: '2', startTime: 10, endTime: 21, text: 'Hôm nay chúng ta sẽ tìm hiểu về khái niệm đạo hàm và vi phân.' },
  { id: '3', startTime: 21, endTime: 34, text: 'Đây là một trong những phần quan trọng nhất của chương trình Toán lớp 12.' },
  { id: '4', startTime: 34, endTime: 48, text: 'Trước hết, chúng ta hãy xem xét tốc độ thay đổi tức thời của một hàm số.' },
  { id: '5', startTime: 48, endTime: 62, text: 'Giả sử chúng ta có một hàm số y bằng f x liên tục trên một khoảng.' },
  { id: '6', startTime: 62, endTime: 75, text: 'Khi x thay đổi một lượng nhỏ, thì giá trị của y cũng thay đổi theo.' },
  { id: '7', startTime: 75, endTime: 90, text: 'Tỷ số giữa sự thay đổi của y và sự thay đổi của x được gọi là tốc độ thay đổi trung bình.' },
  { id: '8', startTime: 90, endTime: 105, text: 'Và đạo hàm chính là giới hạn của tỷ số đó khi sự thay đổi của x tiến dần về không.' },
];

export const mockSummary = [
  {
    time: '0:00 – 1:00',
    bullets: [
      'Giới thiệu khái niệm đạo hàm và tầm quan trọng của nó.',
      'Liên hệ đạo hàm với tốc độ thay đổi tức thời trong thực tế.',
      'Chuẩn bị các công cụ toán học cần thiết cho bài học.'
    ],
    keywords: ['Đạo hàm', 'Toán 12', 'Tổng quan']
  },
  {
    time: '1:00 – 2:00',
    bullets: [
      'Định nghĩa toán học của đạo hàm thông qua giới hạn (limit).',
      'Cách tính đạo hàm cơ bản cho các hàm đa thức.',
      'Quy tắc tính đạo hàm tổng và tích đơn giản.'
    ],
    keywords: ['Giới hạn', 'Công thức', 'Quy tắc tính']
  }
];
