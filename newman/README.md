# Newman Test Files

## ไฟล์ Test

ไฟล์ Test หลักอยู่ที่:

- **`newman/CoWorkingSpace.postman_collection.json`** - Postman Collection ที่มี test cases ทั้งหมด 12 ข้อ
- **`newman/CoWorkingSpace.postman_environment.json`** - Environment variables สำหรับ tests

## Test Cases (12 ข้อ)

1. User Registration + Validation
2. User Log-in
3. User View Product (Rooms)
4. User Create Booking
5. User View Own Booking
6. User Edit Own Booking
7. User Delete Own Booking
8. User Log-out
9. Admin Log-in
10. Admin View Any Booking
11. Admin Edit Any Booking
12. Admin Delete Any Booking

## วิธีรัน Tests

```bash
npm run newman
```

หรือ

```bash
npm test
```


