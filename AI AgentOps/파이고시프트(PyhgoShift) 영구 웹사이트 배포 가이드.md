# 파이고시프트(PyhgoShift) 영구 웹사이트 배포 가이드

## 📍 현재 배포 상태

### 임시 배포 (테스트 중)
- **URL:** https://8083-i7w3o2coftmow9rhb5qjk-866422b4.sg1.manus.computer
- **상태:** 정상 작동 확인 완료
- **유효 기간:** 샌드박스 활성 기간 동안

---

## 🚀 영구 배포 옵션

### Option 1: GitHub Pages (권장)

#### 단계별 배포 가이드

1. **GitHub 저장소 생성**
   ```bash
   # GitHub에서 새 저장소 생성: pyhgoshift-website
   # 저장소 URL: https://github.com/[YOUR_USERNAME]/pyhgoshift-website
   ```

2. **로컬 저장소 설정**
   ```bash
   cd /home/ubuntu/pyhgoshift-website
   git remote add origin https://github.com/[YOUR_USERNAME]/pyhgoshift-website.git
   git branch -M main
   git push -u origin main
   ```

3. **GitHub Pages 활성화**
   - GitHub 저장소 Settings 접속
   - "Pages" 섹션 선택
   - Source: "Deploy from a branch" 선택
   - Branch: "main" 선택
   - Folder: "/ (root)" 선택
   - Save 클릭

4. **배포 완료**
   - 약 1-2분 후 다음 URL에서 접근 가능:
   - `https://[YOUR_USERNAME].github.io/pyhgoshift-website`

---

### Option 2: Vercel

#### 단계별 배포 가이드

1. **Vercel 계정 생성**
   - https://vercel.com 방문
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 기본 설정 유지 후 "Deploy" 클릭

3. **배포 완료**
   - 자동 생성된 URL에서 접근 가능
   - 예: `https://pyhgoshift-website.vercel.app`

---

### Option 3: Netlify

#### 단계별 배포 가이드

1. **Netlify 계정 생성**
   - https://netlify.com 방문
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - "New site from Git" 클릭
   - GitHub 저장소 선택
   - 기본 설정 유지 후 배포

3. **배포 완료**
   - 자동 생성된 URL에서 접근 가능

---

## 📋 배포 체크리스트

- [ ] 웹사이트 로컬 테스트 완료 (index.html, README.md)
- [ ] Git 저장소 초기화 및 커밋 완료
- [ ] GitHub 저장소 생성 및 원격 연결
- [ ] GitHub Pages / Vercel / Netlify 중 하나 선택
- [ ] 배포 완료 및 URL 확인
- [ ] 도메인 커스터마이징 (선택사항)

---

## 🔧 커스텀 도메인 설정 (선택사항)

### GitHub Pages에서 커스텀 도메인 설정

1. 도메인 DNS 설정
   ```
   A 레코드: 185.199.108.153
   A 레코드: 185.199.109.153
   A 레코드: 185.199.110.153
   A 레코드: 185.199.111.153
   ```

2. GitHub 저장소 Settings > Pages에서 커스텀 도메인 입력
   - 예: `pyhgoshift.com`

3. DNS 설정 확인 (최대 24시간 소요)

---

## 📊 배포 후 모니터링

### Google Analytics 추가 (선택사항)

```html
<!-- index.html의 </head> 태그 직전에 추가 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔐 보안 고려사항

- [ ] HTTPS 자동 활성화 확인 (GitHub Pages/Vercel/Netlify에서 자동 제공)
- [ ] 민감한 정보 노출 확인
- [ ] robots.txt 설정 (선택사항)
- [ ] sitemap.xml 생성 (선택사항)

---

## 📝 배포 후 유지보수

### 정기 업데이트

```bash
# 로컬에서 변경 후
git add .
git commit -m "Update: [변경 사항 설명]"
git push origin main

# GitHub Pages / Vercel / Netlify에서 자동으로 배포됨
```

### 성능 최적화

- 이미지 최적화 (WebP 포맷 사용)
- CSS/JS 최소화
- 캐싱 정책 설정

---

## 📞 배포 후 공유

### 추천 공유 방식

1. **투자자/파트너:**
   - 공식 웹사이트 URL 공유
   - 이메일에 링크 포함

2. **소셜 미디어:**
   - LinkedIn, Twitter에 공유
   - 해시태그: #PyhgoShift #AI #AgentOps

3. **프레젠테이션:**
   - 피치덱에 웹사이트 URL 포함
   - QR 코드 생성하여 슬라이드에 추가

---

**© 2026 PyhgoShift - Powered by Manus AI Commander**

*"기능 성공이 아닌, 제품의 성공을 설계합니다"*
