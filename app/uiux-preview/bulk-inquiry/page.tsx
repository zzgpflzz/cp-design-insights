'use client';

// Figma 이미지 에셋
const imgGroup = "https://www.figma.com/api/mcp/asset/0a5c1fbc-a0d1-4e92-93e6-5adc400a9e16";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/52fdac05-67b7-4837-87b0-1ec3f4bbc7f5";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/78015fd2-cfc0-4cf5-8676-afb2e4823ecd";
const imgStroke15Copy3 = "https://www.figma.com/api/mcp/asset/d1d613e6-ee1e-4338-a3ea-e4b14481981c";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/a6ad9ac8-9e0f-40c6-a83f-7cea56a89ae7";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/bb617d40-e393-4428-89a2-eebf50043036";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/6176ec80-4e3b-4745-a4a4-eb655cea4c07";
const imgIpxIconSearch = "https://www.figma.com/api/mcp/asset/de85ac23-c513-4498-a2d2-eedeea928ec4";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/98651866-226b-45ce-b94c-5ea54710322d";
const imgStroke1 = "https://www.figma.com/api/mcp/asset/17e13258-ce62-4456-99f6-bb2773257fd6";
const imgStroke3 = "https://www.figma.com/api/mcp/asset/e02fdf1d-a70d-404e-bba9-1147087e2ee5";
const imgPath = "https://www.figma.com/api/mcp/asset/fec6864d-c6a5-48f7-8070-1b7cf94f875d";
const imgOval = "https://www.figma.com/api/mcp/asset/c7f9730d-1ef1-4ac4-94cb-30683ccc7209";
const imgOval1 = "https://www.figma.com/api/mcp/asset/b3be0ea0-e458-41b6-9640-fdf2380ac13b";
const imgOval2 = "https://www.figma.com/api/mcp/asset/23752d3b-673c-40cb-babd-c8ec80c58f01";
const imgOval3 = "https://www.figma.com/api/mcp/asset/dc22a571-6690-42f2-b56b-6aaa16f66070";

function PcHeader() {
  return (
    <div className="h-[151px] relative w-full bg-white">
      <div className="absolute flex h-[54px] items-center justify-center left-0 top-[96px] w-full">
        <div className="-scale-y-100 flex-none">
          <div className="bg-white h-[54px] relative w-full" />
        </div>
      </div>
      <div className="absolute bg-[#f0f2f4] h-px left-0 top-[150px] w-full" />

      {/* Navigation */}
      <div className="absolute content-stretch flex gap-[32px] items-center left-[370px] text-[16px] font-bold top-[112px] uppercase">
        <div className="flex flex-col justify-center">세일탭</div>
        <div className="flex flex-col justify-center">베스트</div>
        <div className="flex flex-col justify-center">신제품</div>
        <div className="flex flex-col justify-center">카테고리</div>
        <div className="flex flex-col justify-center">이벤트</div>
        <div className="flex flex-col justify-center">K-POP</div>
        <div className="flex flex-col justify-center">브랜드</div>
        <div className="flex flex-col justify-center">SALE</div>
      </div>

      <div className="absolute bg-white h-[96px] left-0 top-0 w-full" />

      {/* Global Official Badge */}
      <div className="absolute bg-black content-stretch flex items-center justify-center p-[6px] rounded-[2px] right-[280px] top-[52px]">
        <p className="font-bold text-[12px] text-center text-white tracking-[0.6px] whitespace-nowrap">
          GLOBAL OFFICIAL
        </p>
      </div>

      {/* Icons */}
      <div className="absolute right-[340px] size-[24px] top-[50px]">
        <img alt="Search" className="block max-w-none size-full" src={imgIpxIconSearch} />
      </div>
      <div className="absolute right-[236px] size-[24px] top-[50px]">
        <img alt="My" className="block max-w-none size-full" src={imgGroup6} />
      </div>
      <div className="absolute right-[288px] size-[24px] top-[50px]">
        <img alt="Cart" className="block max-w-none size-full" src={imgStroke1} />
      </div>

      {/* Language/Region */}
      <div className="absolute right-[100px] text-[12px] text-[#616161] top-[19px]">한국어</div>
      <div className="absolute right-[180px] text-[12px] text-[#616161] top-[19px]">대한민국 (KRW ₩)</div>

      {/* Logo */}
      <div className="absolute h-[20px] left-[370px] top-[52px] w-[374px] overflow-clip">
        <img alt="LINE FRIENDS SQUARE" className="h-full" src={imgGroup3} />
      </div>
    </div>
  );
}

function PcFooter() {
  return (
    <div className="h-[378px] relative w-full bg-[#f6f8fa] border-t border-[#ebedee]">
      <div className="absolute flex flex-col gap-[20px] left-[1070px] top-[145px] text-[15px] font-bold uppercase">
        <div>1:1 문의</div>
        <div>멤버십</div>
        <div>공고</div>
      </div>

      <div className="absolute left-[1270px] top-[145px]">
        <div className="text-[15px] font-bold uppercase mb-[15px]">Follow Us</div>
        <div className="text-[13px] text-[#3f3f3f] mb-[12px]">INSTAGRAM</div>
        <div className="text-[13px] text-[#3f3f3f]">X (Twitter)</div>
      </div>

      <div className="absolute bottom-[60px] left-[370px] text-[13px] text-[#3f3f3f]">
        © LINE FRIENDS SQUARE All Rights Reserved.
      </div>

      <div className="absolute bg-[#3f3f3f] h-px left-[370px] right-[370px] top-[281px]" />

      {/* Logo */}
      <div className="absolute left-[370px] top-[107px] h-[60px]">
        <img alt="LINE FRIENDS SQUARE" className="h-full" src={imgGroup} />
      </div>

      {/* Footer Links */}
      <div className="absolute content-stretch flex gap-[16px] items-center left-[370px] top-[40px] text-[15px] font-bold uppercase">
        <div>ABOUT US</div>
        <div className="bg-[#a0a0a0] h-[12px] w-px" />
        <div>사이트맵</div>
        <div className="bg-[#a0a0a0] h-[12px] w-px" />
        <div>서비스 약관</div>
        <div className="bg-[#a0a0a0] h-[12px] w-px" />
        <div>개인정보처리방침</div>
        <div className="bg-[#a0a0a0] h-[12px] w-px" />
        <div>배송・환불</div>
      </div>

      <div className="absolute left-[370px] top-[145px]">
        <div className="text-[15px] font-bold mb-[12px]">고객센터</div>
        <div className="flex gap-[8px] items-center text-[13px] text-[#3f3f3f] mb-[8px]">
          <span>고객센터 : 1544-5921</span>
          <div className="bg-[#3f3f3f] h-[11px] w-px" />
          <span>이메일 : square_cs@linefriends.com</span>
        </div>
        <div className="text-[13px] text-[#3f3f3f]">
          평일 09:00 – 18:00 (점심 12:00-13:00)
        </div>

        <div className="text-[15px] font-bold mt-[20px]">
          라인프렌즈 스퀘어 주식회사 사업자 정보
        </div>
      </div>
    </div>
  );
}

export default function BulkInquiryPage() {
  return (
    <div className="bg-white min-h-screen">
      <PcHeader />

      <main className="max-w-[1920px] mx-auto px-[370px] py-[56px]">
        {/* Breadcrumb */}
        <div className="flex gap-[12px] items-center text-[18px] mb-[34px]">
          <span className="text-[#a0a0a0]">제휴 문의</span>
          <span className="font-bold text-[#111]">대량구매 문의</span>
        </div>

        <div className="h-[2px] bg-[#111] mb-[18px]" />

        {/* Notice Box */}
        <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
          <div className="font-bold text-[15px] text-[#616161] mb-[16px]">
            문의 전 꼭 확인해주세요!
          </div>
          <div className="text-[15px] text-[#616161] leading-[1.45]">
            <p className="font-bold mb-[8px]">[목적]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>공급 희망 업체에 대한 사전 확인이 필요합니다.</li>
              <li>리셀, 수출 등 영리 목적의 공급은 불가합니다.</li>
            </ul>

            <p className="font-bold mb-[8px]">[혜택 제한]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>쿠폰/적립금 등 추가 할인 혜택은 제한되며, 구매 건에 대한 적립금은 지급되지 않습니다.</li>
            </ul>

            <p className="font-bold mb-[8px]">[회원 구매 전용]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>무신사스토어 회원 가입 후 회원 로그인 상태에서 구매 가능합니다.</li>
              <li>사업자 회원 가입, 비회원 주문은 불가능합니다.</li>
            </ul>

            <p className="font-bold mb-[8px]">[결제 수단]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>공급 후 결제(후불 결제)는 불가합니다.</li>
              <li>주문 시점의 재고로 공급이 가능하며, 재고 수급 및 홀딩은 불가합니다.</li>
              <li>카드 결제를 권장드리며, 계좌이체 희망 시 가상계좌 입금으로 진행되고 1회 50만 원 한도 제한이 있습니다.</li>
            </ul>

            <p className="font-bold mb-[8px]">[상품 정보]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>공급 희망 상품 정보를 정확히 기입하지 않으면, 공급 여부 확인이 불가합니다.<br />(상품 링크/브랜드명/상품명/컬러/사이즈 옵션)</li>
            </ul>

            <p className="font-bold mb-[8px]">[가능 여부]</p>
            <ul className="list-disc ml-[22.5px] mb-[16px]">
              <li>스토어 내 판매 중인 상품, 판매 가능한 옵션 내에 한하여 공급이 가능합니다.</li>
              <li>품절, 미제공 옵션은 공급 불가하며, 사이즈 옵션별 재고 수량은 상이합니다.</li>
              <li>단일 상품 기준 총 구매 수량, 할인 진행 여부 확인 후 공급 가능 여부가 달라질 수 있습니다.</li>
              <li>현재 진행 중인 프로모션 할인율이 대량 구매 최대 할인율보다 높거나 같은 경우에는 일반 구매로 전환됩니다.</li>
              <li>프로모션 진행 일정은 내부 운영 정책 및 재고 상황에 따라 유동적으로 변경될 수 있습니다.</li>
            </ul>

            <p className="font-bold mb-[8px]">[회신 일자]</p>
            <ul className="list-disc ml-[22.5px]">
              <li>영업일 기준 5일 이내에 담당자가 배정되어 이메일 혹은 유선으로 회신을 드립니다.</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-[40px]">
          {/* 담당자명 */}
          <div>
            <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
              <span>담당자명</span>
              <span className="text-[#f83baa]">*</span>
            </div>
            <input
              type="text"
              placeholder="담당자명을 입력하세요"
              className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
              <span>전화번호</span>
              <span className="text-[#f83baa]">*</span>
            </div>
            <input
              type="tel"
              placeholder="전화번호를 입력하세요"
              className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* 이메일 */}
          <div>
            <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
              <span>이메일</span>
              <span className="text-[#f83baa]">*</span>
            </div>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* 문의 내용 */}
          <div>
            <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
              <span>문의 내용</span>
              <span className="text-[#f83baa]">*</span>
            </div>
            <textarea
              placeholder="문의 내용을 입력하세요"
              rows={6}
              className="w-full px-[14px] py-[12px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0] resize-none"
            />
          </div>

          {/* 구매 희망 제품 */}
          <div>
            <div className="text-[14px] font-bold mb-[12px]">
              구매 희망 제품 (중복선택 가능)
            </div>
            <div className="flex gap-[8px]">
              <input
                type="text"
                placeholder="구매를 희망하는 제품의 url을 입력하세요"
                className="flex-1 h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
              />
              <button className="px-[24px] h-[40px] border border-[#111] rounded-[2px] text-[15px] font-bold">
                추가하기
              </button>
            </div>
          </div>

          {/* 바우처 발행 여부 */}
          <div>
            <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
              <span>바우처 발행 여부</span>
              <span className="text-[#f83baa]">*</span>
            </div>
            <div className="flex gap-[24px] items-center">
              <label className="flex gap-[6px] items-center cursor-pointer">
                <div className="relative size-[18px]">
                  <img alt="" className="size-full" src={imgOval} />
                  <img alt="" className="absolute left-[4.5px] top-[4.5px] size-[9px]" src={imgOval1} />
                </div>
                <span className="text-[15px]">발행</span>
              </label>
              <label className="flex gap-[6px] items-center cursor-pointer">
                <div className="relative size-[18px]">
                  <img alt="" className="size-full" src={imgOval2} />
                  <img alt="" className="absolute left-[4.5px] top-[4.5px] size-[9px]" src={imgOval3} />
                </div>
                <span className="text-[15px]">미발행</span>
              </label>
            </div>
          </div>
        </div>

        <div className="h-[10px] bg-[#f0f2f4] my-[40px]" />

        {/* Privacy Notice */}
        <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
          <div className="font-bold text-[15px] text-[#616161] mb-[12px]">
            제휴 문의 신청을 위해 아래와 같이 개인정보를 수집 및 이용합니다.
          </div>
          <ul className="text-[15px] text-[#616161] leading-[1.45] list-disc ml-[22.5px] space-y-[4px]">
            <li>수집항목 : (기본정보) 회사명, 브랜드명, 홈페이지 주소 (신청 업체의 담당자 정보) 담당자명, 전화번호, 이메일 주소</li>
            <li>이용목적 : 입점 신청 업체의 상담을 위한 수집, 입점, 상담 관련 민원 사무 처리</li>
            <li>보유기간 : 입점 거절 시 5일 이내 파기</li>
            <li>수집한 개인정보는 입점을 위한 상담 외 다른 목적으로는 이용되지 않습니다.</li>
            <li>개인정보 수집 이용 동의를 거부할 권리가 있습니다. 다만, 동의하지 않을 경우 입점 관련 상담이 불가능합니다.</li>
          </ul>
        </div>

        {/* Checkbox */}
        <div className="flex gap-[8px] items-center mb-[40px]">
          <div className="relative size-[20px]">
            <div className="absolute inset-0 bg-black border border-black rounded-[3px]" />
            <img alt="" className="absolute inset-[25%] size-[50%]" src={imgPath} />
          </div>
          <span className="text-[16px] font-bold">
            [필수] 개인정보 수집 및 이용에 동의합니다.
          </span>
        </div>

        {/* Submit Button */}
        <button className="w-full h-[60px] bg-black text-white text-[18px] font-bold rounded-[2px] hover:bg-gray-800 transition-colors">
          문의 등록하기
        </button>
      </main>

      <PcFooter />
    </div>
  );
}
