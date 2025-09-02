✅ Git Bash 첫 실행 시 계정 설정부터 기본 흐름
🔐 1. 사용자 계정 정보 설정 (Global)
bash
복사
편집
git config --global user.name "홍길동"
git config --global user.email "your@email.com"
Git 커밋에 포함될 사용자 정보 설정

--global은 전체 Git 환경에 적용되며, 특정 프로젝트만 설정하고 싶다면 --local 옵션

🔎 2. 설정 확인
bash
복사
편집
git config --list
현재 설정된 이름, 이메일 등 전체 확인

🔑 3. SSH 키 생성 및 GitHub 등록 (HTTPS 대신 SSH 사용할 경우)
bash
복사
편집
ssh-keygen -t ed25519 -C "your@email.com"
기본 경로 (~/.ssh/id_ed25519)에 키 생성

엔터 몇 번 입력하면 완료

bash
복사
편집
cat ~/.ssh/id_ed25519.pub
공개키 복사해서 GitHub → Settings → SSH and GPG Keys에 등록

🌐 4. 원격 저장소 클론 또는 로컬 초기화
로컬 디렉토리에서 Git 시작:
bash
복사
편집
mkdir myproject
cd myproject
git init
또는 GitHub에서 기존 저장소 클론:
bash
복사
편집
git clone git@github.com:username/repo.git
또는 HTTPS:

bash
복사
편집
git clone https://github.com/username/repo.git
🧪 5. 기본 커밋 & 푸시 흐름
bash
복사
편집
touch README.md
git add README.md
git commit -m "init"
git push -u origin main # 또는 master
