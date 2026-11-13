(() => {
  const groups = {
    '가구': '구름 침대|민트 책상|분홍 의자|라벤더 옷장|하늘색 책장|원목 협탁|크림 안락의자|별 벽시계|노랑 방석|분홍 화장대|초록 서랍장',
    '소품': '별 가랜드|버섯 조명|구름 러그|꽃병|파랑 알람 시계|분홍 망원경|미니 지구본|무지개 쿠션|장난감 상자|달 모빌|유리 정원',
    '장난감·피규어': '파랑 로봇|빨강 경주차|티라노사우루스|트리케라톱스|몬스터 트럭|노랑 잠수함|분홍 로켓|우주인 피규어|파스텔 기차|합체 로봇|보라 공룡 알',
    '액자': '별빛 고양이 액자|구름 여우 액자|새싹 거북이 액자|물방울 수달 액자|불꽃 용 액자|달토끼 액자|무지개 액자|달 액자|고래 액자|로켓 액자|꽃 액자',
  };
  const sheets = ['furniture','decor','toys','frames'];
  window.HosuCatalog = Object.entries(groups).flatMap(([group,names],g) =>
    names.split('|').map((name,i) => {
      const id = sheets[g] + '-' + (i + 1);
      return [id,name,'',g===2 ? 10 : g===3 ? (i<6?6:3) : 4+(i%3),'/study/art/'+id+'.webp',group];
    })).concat([
      ['special-1','민트 클래식 자동차','',10,'/study/art/special-1.webp','장난감·피규어'],
      ['special-2','보라 인형 뽑기 기계','',12,'/study/art/special-2.webp','장난감·피규어'],
    ]);
})();
