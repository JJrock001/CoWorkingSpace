# วิธีรัน Newman Tests

## ติดตั้ง Dependencies

```bash
npm install
```

## รัน Tests

### วิธีที่ 1: ใช้ npm script (แนะนำ)
```bash
npm test
```

### วิธีที่ 2: ใช้ Newman โดยตรง
```bash
npx newman run newman/CoWorkingSpace.postman_collection.json -e newman/CoWorkingSpace.postman_environment.json -r cli
```

### วิธีที่ 3: แสดงรายละเอียดเพิ่มเติม
```bash
npm run test:verbose
```

## ผลลัพธ์

- **Console Output**: แสดงผลใน terminal
- **HTML Report**: `newman-report.html` (เปิดใน browser)

## หมายเหตุ

- ต้องรัน server ก่อน: `npm run dev`
- ต้องมี admin user ในระบบ (email: admin@example.com, password: admin123456)
- ต้องมี room ในระบบก่อน (สร้างผ่าน admin API)

