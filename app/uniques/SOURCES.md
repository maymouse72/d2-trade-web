# 유니크 도감 데이터 및 이미지 출처

- 확인일: 2026-10-27
- 수치 원본: https://github.com/blizzhackers/d2data — uniqueitems 변경 기준 fc469993502d, patch 3.3.93847.
- 사용 테이블: json/uniqueitems.json, weapons.json, armor.json, misc.json, properties.json, skills.json, localestrings-kor.json, localestrings-eng.json.
- 현재 한글 명칭 대조: https://github.com/SeonEngineer/D2R/blob/main/item-names.json (게임 언어 문자열; 일부 신규 항목 없음).
- 이미지 원본: https://classic.battle.net/diablo2exp/items/uniques.shtml 아래 공식 분류 페이지. 이미지별 원본 URL은 public/uniques/manifest.json 참조. GIF/JPG 원본을 변경하지 않고 저장.
- d2data 저장소 MIT 저작권 고지는 app/uniques/source-license.txt에 보존. 게임 문자열·아트의 권리는 Blizzard Entertainment에 있으며 소프트웨어 라이선스가 게임 아트 이용 허락을 대신하지 않는다.
- 이미지 이용 조건: https://www.blizzard.com/en-us/legal/10390250-087d-41fd-aa47-1a44cbacb10b/legal-faq. 광고 사이트의 공개 이용 허용까지 확인한 것은 아님. 공개 배포 전 확인 필요.

## 범위와 변환

396개 항목, 이미지 연결 379개 (미확보 17개) / 원본 이미지 파일 298개. 이름이 같은 무지개 자락은 8개 속성/발동 조건으로 분리. spawnable=1만 사용하며 퀘스트 장비, 제작 후 중복 내부 항목, Unique Warlock Helm 플레이스홀더 제외.

이름에 따라 임의로 수치를 채우지 않음. 장비의 normcode/ubercode/ultracode로 기본 등급 분류. 기본 장비 수치는 최종 옵션 적용 수치와 분리 표시. 레벨당 옵션은 테이블의 /8 또는 /2 단위로 표시. 스킬 발동의 min/max는 확률/레벨이며 변동 범위로 오인하지 않도록 처리. 원소 피해의 최소/최대 피해도 변동 옵션으로 분류하지 않음. 독은 내부 피해율 × 지속 프레임 / 256으로 총 피해를 계산하며 올림 표시. 지속시간은 프레임/25로 변환. 흡수 속성은 실제 stat 정의에 따라 고정/퍼센트 구분.

## 명시한 한계

- 11개 최근 추가 아이템은 공식 이미지와 최신 한글 이름 미확보. 면역 파괴 부적 6종은 한글명은 있으나 이미지 미확보: 영문 이름 및 '이미지 미확보'로 표시.
- 기술 이름은 원본 영문 이름을 사용하며 일부 옵션 용어는 원본 데이터 의미에 맞춰 한글로 변환.
- 3개 신규 복합 효과(roguesbow-affix1, skilltab-war, magdam-rand)는 상세 정의를 확인하지 못해 '세부 조건 확인 중'으로 표시. 해당 대상은 도감의 인게임 수치 전체를 검증했다고 볼 수 없다.
- 별칭은 대표 아이템부터 수동 추가. 전 항목의 구어 별칭이 완비된 것은 아님.
- 무형, 업그레이드, 장착 보너스, 직업별 기본 보너스에 따른 최종 피해/방어력/착용 조건의 실시간 계산은 제공하지 않음.
- 원본의 시즌 조건은 상세에 보존. 모든 서버/시즌에서 드롭 가능하다고 보장하지 않음.

면역 파괴 부적은 현재 데이터의 PreCrafted 6종을 사용하되 표시명에서 내부 접두사를 제거하고 게임 이름으로 연결했다. spawnable이 비활성인 과거 동일 이름 행과 중복하지 않는다.
