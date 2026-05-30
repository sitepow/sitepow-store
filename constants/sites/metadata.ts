export const PRODUCT_METADATA_MASTER = [
  {
    category: 'ข้อมูลทั่วไปและแบรนด์',
    fields: [
      { key: 'brand', label: 'แบรนด์ / ยี่ห้อ' },
      { key: 'model', label: 'รุ่น' },
      { key: 'series', label: 'ซีรีส์' },
      { key: 'country_of_origin', label: 'ประเทศผู้ผลิต' },
      { key: 'warranty_period', label: 'ระยะเวลาการรับประกัน' },
      { key: 'warranty_type', label: 'ประเภทการรับประกัน' },
      { key: 'manufacturer', label: 'ชื่อผู้ผลิต / โรงงาน' },
      {
        key: 'condition',
        label: 'สภาพสินค้า (เช่น ใหม่, มือสอง, รีเฟอร์บิช)',
      },
    ],
  },
  {
    category: 'ขนาดและลักษณะทางกายภาพ',
    fields: [
      { key: 'material', label: 'วัสดุ' },
      { key: 'weight', label: 'น้ำหนัก' },
      { key: 'dimensions', label: 'ขนาด (กว้าง x ยาว x สูง)' },
      { key: 'size', label: 'ขนาด' },
      { key: 'color', label: 'สี / ลวดลาย' },
      { key: 'capacity_volume', label: 'ความจุ / ปริมาตร' },
      { key: 'diameter', label: 'เส้นผ่านศูนย์กลาง' },
      { key: 'thickness', label: 'ความหนา' },
      { key: 'shape', label: 'รูปทรง' },
      { key: 'packaging_size', label: 'ขนาดบรรจุภัณฑ์' },
    ],
  },
  {
    category: 'ระบบไฟฟ้าและแบตเตอรี่',
    fields: [
      { key: 'battery_capacity', label: 'ความจุแบตเตอรี่' },
      { key: 'battery_life', label: 'ระยะเวลาการใช้งานแบตเตอรี่' },
      { key: 'charging_time', label: 'เวลาในการชาร์จ' },
      { key: 'charging_port', label: 'พอร์ตชาร์จ' },
      { key: 'power_consumption', label: 'กำลังไฟฟ้า (วัตต์)' },
      { key: 'voltage', label: 'แรงดันไฟฟ้า (โวลต์)' },
      { key: 'battery_type', label: 'ประเภทแบตเตอรี่' },
      { key: 'plug_type', label: 'ประเภทหัวปลั๊ก' },
      {
        key: 'power_source',
        label: 'แหล่งพลังงาน (เช่น ถ่าน, เสียบปลั๊ก, โซลาร์เซลล์)',
      },
    ],
  },
  {
    category: 'การเชื่อมต่อและฮาร์ดแวร์',
    fields: [
      {
        key: 'connectivity_type',
        label: 'การเชื่อมต่อ (เช่น Wi-Fi, Bluetooth, มีสาย)',
      },
      { key: 'bluetooth_version', label: 'เวอร์ชันบลูทูธ' },
      {
        key: 'interface_port',
        label: 'พอร์ตการเชื่อมต่อ (เช่น USB-C, HDMI, AUX)',
      },
      { key: 'operating_system', label: 'ระบบปฏิบัติการที่รองรับ' },
      { key: 'wireless_range', label: 'ระยะการส่งสัญญาณไร้สาย' },
      { key: 'sim_slot', label: 'การรองรับซิมการ์ด' },
    ],
  },
  {
    category: 'ข้อมูลจำเพาะภาพและเสียง',
    fields: [
      { key: 'driver_size', label: 'ขนาดไดรเวอร์ (หูฟัง/ลำโพง)' },
      { key: 'noise_reduction_level', label: 'ระดับการตัดเสียงรบกวน' },
      { key: 'frequency_response', label: 'การตอบสนองความถี่' },
      { key: 'impedance', label: 'ความต้านทานไฟฟ้า' },
      { key: 'resolution', label: 'ความละเอียด (หน้าจอ/กล้อง)' },
      { key: 'display_type', label: 'ประเภทหน้าจอ (เช่น OLED, IPS, LED)' },
      { key: 'brightness', label: 'ความสว่าง' },
      { key: 'refresh_rate', label: 'อัตราการรีเฟรชหน้าจอ (Hz)' },
      { key: 'audio_channel', label: 'ระบบเสียง / ช่องสัญญาณเสียง' },
      { key: 'microphone_specs', label: 'สเปคไมโครโฟน' },
    ],
  },
  {
    category: 'ประสิทธิภาพและการจัดเก็บข้อมูล',
    fields: [
      { key: 'processor_cpu', label: 'หน่วยประมวลผล (CPU)' },
      { key: 'graphics_gpu', label: 'การ์ดจอ (GPU)' },
      { key: 'ram_capacity', label: 'ความจุ RAM' },
      {
        key: 'storage_capacity',
        label: 'ความจุพื้นที่เก็บข้อมูล (ROM/Storage)',
      },
      { key: 'max_speed', label: 'ความเร็วสูงสุด' },
      { key: 'load_capacity', label: 'การรองรับน้ำหนักสูงสุด' },
      { key: 'read_write_speed', label: 'ความเร็วในการอ่าน/เขียนข้อมูล' },
    ],
  },
  {
    category: 'กล้องและการถ่ายภาพ',
    fields: [
      { key: 'sensor_type', label: 'ประเภทเซนเซอร์กล้อง' },
      { key: 'lens_aperture', label: 'รูรับแสง (Aperture)' },
      { key: 'focal_length', label: 'ระยะเลนส์ (Focal Length)' },
      {
        key: 'video_recording_resolution',
        label: 'ความละเอียดการบันทึกวิดีโอ',
      },
      { key: 'iso_range', label: 'ช่วงความไวแสง (ISO)' },
      { key: 'image_stabilization', label: 'ระบบกันสั่น' },
    ],
  },
  {
    category: 'เสื้อผ้า แฟชั่น และเครื่องแต่งกาย',
    fields: [
      { key: 'fabric_type', label: 'ประเภทผ้า / เนื้อผ้า' },
      { key: 'fit_type', label: 'ทรงเสื้อผ้า' },
      { key: 'neckline', label: 'ลักษณะคอเสื้อ' },
      { key: 'sleeve_length', label: 'ความยาวแขนเสื้อ' },
      { key: 'gender', label: 'เพศที่เหมาะสำหรับสินค้า' },
      { key: 'style', label: 'สไตล์ / แฟชั่นหมวดไหน' },
      {
        key: 'closure_type',
        label: 'ลักษณะการเปิด-ปิด (เช่น ซิป, กระดุม, เชือกผูก)',
      },
      { key: 'pattern', label: 'ลวดลายผ้า' },
    ],
  },
  {
    category: 'ความงามและของใช้ส่วนตัว',
    fields: [
      { key: 'skin_type', label: 'เหมาะกับสภาพผิว' },
      { key: 'hair_type', label: 'เหมาะกับสภาพเส้นผม' },
      { key: 'ingredients', label: 'ส่วนผสมสำคัญ' },
      { key: 'spf_rating', label: 'ค่าสารกันแดด (SPF/PA)' },
      { key: 'texture', label: 'เนื้อสัมผัส (เช่น ครีม, เจล, เซรั่ม)' },
      { key: 'scent', label: 'กลิ่น' },
      { key: 'benefits', label: 'สรรพคุณหลัก' },
    ],
  },
  {
    category: 'อาหาร เครื่องดื่ม และของกิน',
    fields: [
      {
        key: 'expiration_date_info',
        label: 'อายุการเก็บรักษา / วันหมดอายุ',
      },
      { key: 'flavor', label: 'รสชาติ' },
      {
        key: 'dietary_information',
        label: 'ข้อมูลทางโภชนาการ (เช่น เจ, ฮาลาล, มังสวิรัติ)',
      },
      { key: 'allergen_information', label: 'ข้อมูลสำหรับผู้แพ้อาหาร' },
      { key: 'organic_status', label: 'สถานะสินค้าออร์แกนิก' },
      {
        key: 'storage_instruction',
        label: 'คำแนะนำในการจัดเก็บ (เช่น ควรแช่เย็น)',
      },
    ],
  },
  {
    category: 'ยานยนต์ เครื่องมือ และงานช่าง',
    fields: [
      { key: 'compatible_models', label: 'รุ่นรถ / อุปกรณ์ที่รองรับ' },
      { key: 'fuel_type', label: 'ประเภทเชื้อเพลิง / พลังงาน' },
      { key: 'engine_capacity', label: 'ความจุเครื่องยนต์ (CC)' },
      { key: 'torque', label: 'แรงบิด' },
      { key: 'horsepower', label: 'กำลังแรงม้า' },
      { key: 'tool_type', label: 'ประเภทเครื่องมือ' },
    ],
  },
  {
    category: 'การป้องกันและสภาพแวดล้อม',
    fields: [
      { key: 'waterproof_rating', label: 'มาตรฐานการกันน้ำ (IP Rating)' },
      { key: 'heat_resistance', label: 'การทนความร้อน' },
      { key: 'shockproof', label: 'การกันกระแทก' },
      { key: 'dustproof_rating', label: 'มาตรฐานการกันฝุ่น' },
      { key: 'uv_protection', label: 'การป้องกันรังสี UV' },
    ],
  },
  {
    category: 'ของใช้ในบ้าน ตกแต่งบ้าน และสวน',
    fields: [
      { key: 'assembly_required', label: 'ความจำเป็นในการประกอบสินค้า' },
      { key: 'room_type', label: 'ห้องที่เหมาะสม (เช่น ห้องนอน, ห้องครัว)' },
      { key: 'indoor_outdoor', label: 'การใช้งานภายใน / ภายนอกอาคาร' },
      {
        key: 'maximum_seats',
        label: 'จำนวนที่นั่งสูงสุด (สำหรับเฟอร์นิเจอร์)',
      },
    ],
  },
  {
    category: 'กีฬา กิจกรรมกลางแจ้ง และการท่องเที่ยว',
    fields: [
      { key: 'sport_type', label: 'ประเภทกีฬา / กิจกรรม' },
      {
        key: 'skill_level',
        label: 'ระดับทักษะผู้เล่น (เช่น เริ่มต้น, มืออาชีพ)',
      },
      { key: 'gear_type', label: 'ประเภทอุปกรณ์กีฬา' },
    ],
  },
  {
    category: 'ของเล่น แม่และเด็ก และสัตว์เลี้ยง',
    fields: [
      { key: 'recommended_age', label: 'ช่วงอายุที่แนะนำ' },
      { key: 'pet_type', label: 'ประเภทสัตว์เลี้ยงที่รองรับ' },
      { key: 'pet_size_breed', label: 'ขนาด / สายพันธุ์สัตว์เลี้ยง' },
      {
        key: 'educational_focus',
        label: 'ทักษะที่ช่วยส่งเสริม (สำหรับของเล่นเด็ก)',
      },
    ],
  },
  {
    category: 'หนังสือ สื่อบันเทิง และเครื่องเขียน',
    fields: [
      { key: 'author_creator', label: 'ผู้เขียน / ผู้แต่ง / ผู้สร้างสรรค์' },
      { key: 'publisher', label: 'สำนักพิมพ์ / ค่าย' },
      { key: 'isbn_issn', label: 'รหัสรหัสสากล (ISBN/ISSN)' },
      { key: 'page_count', label: 'จำนวนหน้า / ความยาว (นาที)' },
      { key: 'language', label: 'ภาษาของเนื้อหา' },
      {
        key: 'book_binding',
        label: 'รูปแบบการเข้าเล่ม (เช่น ปกอ่อน, ปกแข็ง)',
      },
    ],
  },
  {
    category: 'มาตรฐาน ความปลอดภัย และใบรับรอง',
    fields: [
      {
        key: 'certifications',
        label: 'มาตรฐานการรับรอง (เช่น มอก., อย., CE, FDA)',
      },
      { key: 'safety_features', label: 'ระบบความปลอดภัย / ฟีเจอร์เซฟตี้' },
      { key: 'fire_retardant', label: 'คุณสมบัติการทนไฟ / ไม่ลามไฟ' },
    ],
  },
]
