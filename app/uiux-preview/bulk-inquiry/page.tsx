'use client';

import { useState } from 'react';

// Header & Footer 이미지
const imgPcHeader = "https://www.figma.com/api/mcp/asset/d0e253ae-635c-4814-8d65-a26c11165afa";
const imgPcFooter = "https://www.figma.com/api/mcp/asset/9e108dea-5356-4c11-8d44-d6406710e931";

// 제품 이미지
const imgProduct1 = "https://www.figma.com/api/mcp/asset/738af550-8cbf-4b20-9591-fc91e2b95581";
const imgProduct2 = "https://www.figma.com/api/mcp/asset/46a95fff-a6f3-45ae-a6d6-523f03862674";

// 아이콘 이미지
const imgPath = "https://www.figma.com/api/mcp/asset/72e2bba1-7afb-4c58-8911-abed1466a634";
const imgOval = "https://www.figma.com/api/mcp/asset/ca4e35a6-79d1-4f99-a8fc-fc4233578d97";
const imgOval1 = "https://www.figma.com/api/mcp/asset/11df2008-fe0c-4f26-baa4-0f6525f9d195";
const imgOval2 = "https://www.figma.com/api/mcp/asset/7c791b25-c2e9-4c7b-88e4-ea4f926d618c";
const imgOval3 = "https://www.figma.com/api/mcp/asset/5d7cf930-27cc-42c0-bed2-bc5346cdd807";
const imgDeleteIcon = "https://www.figma.com/api/mcp/asset/cf7798b5-15f5-47de-a7d5-76dc5c0bad84";
const imgDropdownIcon = "https://www.figma.com/api/mcp/asset/f9d42d60-9364-4d2e-a98a-087fa3b36c50";

type TabType = 'partnership' | 'bulk';

interface ProductOption {
  id: string;
  name: string;
  quantity: number;
}

interface Product {
  id: string;
  brand: string;
  name: string;
  thumbnail: string;
  selectedOptions: ProductOption[];
  showOptions: boolean;
}

export default function BulkInquiryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('bulk');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [taxInvoice, setTaxInvoice] = useState<'yes' | 'no'>('no');
  const [agreed, setAgreed] = useState(true);

  const availableProducts = [
    {
      id: 'bt21-keyring',
      brand: 'BT21',
      name: 'BT21 비욘드 더 저니 인형 키링',
      thumbnail: imgProduct1,
      previewUrl: '/uiux-preview/product/bt21-keyring'
    },
    {
      id: 'joguman-pillow',
      brand: 'JOGUMAN',
      name: '조구만 우디 바디 필로우',
      thumbnail: imgProduct2,
      previewUrl: '/uiux-preview/product/joguman-pillow'
    }
  ];

  const addProduct = () => {
    if (!selectedProductId) return;

    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    // 이미 추가된 제품인지 확인
    if (products.some(p => p.id === selectedProductId)) {
      alert('이미 추가된 제품입니다.');
      return;
    }

    const newProduct = {
      id: selectedProductId,
      brand: selectedProduct.brand,
      name: selectedProduct.name,
      thumbnail: selectedProduct.thumbnail,
      selectedOptions: [],
      showOptions: false
    };

    setProducts([...products, newProduct]);
    setSelectedProductId('');
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const toggleOptions = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, showOptions: !p.showOptions } : p
    ));
  };

  const addOption = (productId: string, optionName: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const existingOption = p.selectedOptions.find(o => o.name === optionName);
        if (existingOption) return p;

        return {
          ...p,
          selectedOptions: [...p.selectedOptions, {
            id: Date.now().toString(),
            name: optionName,
            quantity: 100
          }]
        };
      }
      return p;
    }));
  };

  const removeOption = (productId: string, optionId: string) => {
    setProducts(products.map(p =>
      p.id === productId
        ? { ...p, selectedOptions: p.selectedOptions.filter(o => o.id !== optionId) }
        : p
    ));
  };

  const updateQuantity = (productId: string, optionId: string, delta: number) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          selectedOptions: p.selectedOptions.map(o => {
            if (o.id === optionId) {
              const newQuantity = Math.max(100, o.quantity + delta);
              return { ...o, quantity: newQuantity };
            }
            return o;
          })
        };
      }
      return p;
    }));
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Image */}
      <div className="h-[151px] w-full">
        <img src={imgPcHeader} alt="Header" className="w-full h-full object-cover" />
      </div>

      <main className="max-w-[1920px] mx-auto flex justify-center py-[56px]">
        <div className="w-[780px]">
        {/* Breadcrumb with Tabs */}
        <div className="flex gap-[12px] items-center text-[18px] mb-[8px]">
          <button
            onClick={() => setActiveTab('partnership')}
            className={activeTab === 'partnership' ? 'font-bold text-[#111]' : 'text-[#a0a0a0]'}
          >
            제휴 문의
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={activeTab === 'bulk' ? 'font-bold text-[#111]' : 'text-[#a0a0a0]'}
          >
            대량구매 문의
          </button>
        </div>

        <div className="h-[2px] bg-[#111] mb-[18px]" />

        {/* 제휴 문의 탭 */}
        {activeTab === 'partnership' && (
          <>
            {/* Notice Box */}
            <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
              <div className="font-bold text-[13px] text-[#616161] mb-[16px]">
                문의 전 꼭 확인해주세요!
              </div>
              <ul className="text-[13px] text-[#616161] leading-[1.45] list-disc ml-[22.5px] space-y-[4px]">
                <li>아래 필수 입력사항을 반드시 입력하여 제출해 주세요.</li>
                <li>브랜드 미공개 광고문의는 답변드리지 않습니다.</li>
                <li>모든 등록 건은 담당자가 확인하여 이메일이나 전화로 회신드리오니, 중복 등록에 유의하여 주시기 바랍니다.</li>
                <li>용량이 큰 자료는 파일첨부나 이메일 수신이 불가합니다.<br />포털사이트/웹하드 공유 시스템을 이용하시기 바랍니다.</li>
                <li>파일명이 한글/영문/숫자를 제외한 특수문자 및 공백, 다른 나라 언어가 있을 경우 첨부되지 않으니 주의하시기 바랍니다.</li>
                <li>브랜드 정보를 상세하게 입력하셔야 빠른 처리가 가능하며, 단순 입점 방식에 대한 문의는 답변드리지 않습니다.</li>
              </ul>
            </div>

            {/* Form */}
            <div className="space-y-[20px]">
              {/* 제휴 카테고리 */}
              <div>
                <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
                  <span>제휴 카테고리</span>
                  <span className="text-[#f83baa]">*</span>
                </div>
                <select className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] text-[#a0a0a0]">
                  <option>카테고리를 선택하세요</option>
                  <option>제품 협업</option>
                  <option>유통 협업</option>
                  <option>팝업 스토어</option>
                  <option>공동 마케팅</option>
                  <option>기타</option>
                </select>
              </div>

              {/* 브랜드명 */}
              <div>
                <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
                  <span>브랜드명</span>
                  <span className="text-[#f83baa]">*</span>
                </div>
                <input
                  type="text"
                  placeholder="브랜드명을 입력하세요"
                  className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
                />
              </div>

              {/* 회사명 */}
              <div>
                <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
                  <span>회사명</span>
                  <span className="text-[#f83baa]">*</span>
                </div>
                <input
                  type="text"
                  placeholder="회사명을 입력하세요"
                  className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
                />
              </div>

              {/* 사업장 주소 */}
              <div>
                <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
                  <span>사업장 주소</span>
                  <span className="text-[#f83baa]">*</span>
                </div>
                <div className="space-y-[8px]">
                  <div className="flex gap-[8px]">
                    <input
                      type="text"
                      placeholder="우편번호"
                      className="flex-1 h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0] bg-[#f6f8fa]"
                      readOnly
                    />
                    <button className="px-[24px] h-[40px] border border-[#f83baa] rounded-[2px] text-[15px] font-bold text-[#f83baa]">
                      주소검색
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="주소"
                    className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0] bg-[#f6f8fa]"
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="상세주소"
                    className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0]"
                  />
                </div>
              </div>

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
                  placeholder="전화번호를 입력하세요"
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
                  placeholder="아래 항목을 기준으로 협력 내용을 적어주세요.&#10;- 제안 배경&#10;- 세부 제안 내용&#10;- 제휴 기대 효과"
                  rows={6}
                  className="w-full px-[14px] py-[12px] border border-[#dcdee0] rounded-[2px] text-[15px] placeholder:text-[#a0a0a0] resize-none"
                />
              </div>

              {/* 파일 첨부 */}
              <div>
                <div className="text-[14px] font-bold mb-[12px]">
                  파일 첨부
                </div>
                <div className="w-[76px] h-[76px] bg-[#3f3f3f] rounded-[2px] flex items-center justify-center cursor-pointer">
                  <div className="text-white text-[24px]">+</div>
                </div>
                <div className="text-[13px] text-[#a0a0a0] mt-[8px]">
                  *5MB 이상은 첨부할 수 없습니다.<br />
                  *파일은 최대 3개까지 등록 가능합니다.
                </div>
              </div>
            </div>

            <div className="h-[10px] bg-[#f0f2f4] my-[40px]" />

            {/* Privacy Notice */}
            <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
              <div className="font-bold text-[13px] text-[#616161] mb-[12px]">
                LINE FRIENDS SQUARE는 제휴를 희망하는 기업 및 개인을 대상으로 아래와 같이 개인정보를 수집하고 있습니다.
              </div>
              <div className="text-[13px] text-[#616161] leading-[1.45]">
                <ol className="list-decimal ml-[22.5px] space-y-[4px]">
                  <li>수집 개인정보 항목 : [필수] 업체명, 이름, 연락처, 이메일 / [선택] 홈페이지</li>
                  <li>개인정보의 수집 및 이용목적 : 제휴신청에 따른 본인확인 및 원활한 의사소통 경로 확보</li>
                  <li>개인정보의 이용기간 : 등록일 기준 1개월 후, 해당 정보를 지체 없이 파기합니다.</li>
                  <li>동의 거부권리 안내 추가 :위와 같은 개인정보 수집 동의를 거부할 수 있습니다.<br />다만 동의를 거부하는 경우 제휴 제안 신청이 제한될 수 있습니다.</li>
                </ol>
                <p className="mt-[8px]">그 밖의 사항은 각 사별 개인정보처리방침을 준수합니다.</p>
              </div>
            </div>
          </>
        )}

        {/* 대량구매 문의 탭 */}
        {activeTab === 'bulk' && (
          <>
            {/* Notice Box */}
            <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
              <div className="font-bold text-[13px] text-[#616161] mb-[16px]">
                문의 전 꼭 확인해주세요!
              </div>
              <div className="text-[13px] text-[#616161] leading-[1.45] space-y-[12px]">
                <div>
                  <p className="font-bold mb-[8px]">[목적]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>공급 희망 업체에 대한 사전 확인이 필요합니다.</li>
                    <li>리셀, 수출 등 영리 목적의 공급은 불가합니다.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[혜택 제한]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>쿠폰/적립금 등 추가 할인 혜택은 제한되며, 구매 건에 대한 적립금은 지급되지 않습니다.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[회원 구매 전용]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>무신사스토어 회원 가입 후 회원 로그인 상태에서 구매 가능합니다.</li>
                    <li>사업자 회원 가입, 비회원 주문은 불가능합니다.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[결제 수단]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>공급 후 결제(후불 결제)는 불가합니다.</li>
                    <li>주문 시점의 재고로 공급이 가능하며, 재고 수급 및 홀딩은 불가합니다.</li>
                    <li>카드 결제를 권장드리며, 계좌이체 희망 시 가상계좌 입금으로 진행되고 1회 50만 원 한도 제한이 있습니다.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[상품 정보]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>공급 희망 상품 정보를 정확히 기입하지 않으면, 공급 여부 확인이 불가합니다.<br />(상품 링크/브랜드명/상품명/컬러/사이즈 옵션)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[가능 여부]</p>
                  <ul className="list-disc ml-[22.5px] space-y-[4px]">
                    <li>스토어 내 판매 중인 상품, 판매 가능한 옵션 내에 한하여 공급이 가능합니다.</li>
                    <li>품절, 미제공 옵션은 공급 불가하며, 사이즈 옵션별 재고 수량은 상이합니다.</li>
                    <li>단일 상품 기준 총 구매 수량, 할인 진행 여부 확인 후 공급 가능 여부가 달라질 수 있습니다.</li>
                    <li>현재 진행 중인 프로모션 할인율이 대량 구매 최대 할인율보다 높거나 같은 경우에는 일반 구매로 전환됩니다.</li>
                    <li>프로모션 진행 일정은 내부 운영 정책 및 재고 상황에 따라 유동적으로 변경될 수 있습니다.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-[8px]">[회신 일자]</p>
                  <ul className="list-disc ml-[22.5px]">
                    <li>영업일 기준 5일 이내에 담당자가 배정되어 이메일 혹은 유선으로 회신을 드립니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-[20px]">
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
                  placeholder="전화번호를 입력하세요"
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
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <div className="text-[14px] font-bold">
                    구매 희망 제품 (중복선택 가능)
                  </div>
                  <div className="text-[14px] text-[#a0a0a0]">
                    대량구매는 최소 100개부터 주문 가능하며, 20개 단위로 추가할 수 있습니다.
                  </div>
                </div>
                <div className="flex gap-[8px] mb-[16px]">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] text-[#111]"
                  >
                    <option value="">제품을 선택하세요</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.brand} - {product.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addProduct}
                    className="px-[24px] h-[40px] border border-[#111] rounded-[2px] text-[15px] font-bold hover:bg-gray-50"
                  >
                    추가하기
                  </button>
                </div>

                {/* 추가된 제품 목록 */}
                {products.length > 0 && (
                  <div className="space-y-[16px]">
                    {products.map((product) => (
                      <div key={product.id} className="bg-[#f6f8fa] border border-[#dcdee0] rounded-[2px] p-[20px] relative">
                        {/* 제품 삭제 버튼 */}
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute right-[20px] top-[20px] w-[12px] h-[12px]"
                        >
                          <img src={imgDeleteIcon} alt="삭제" className="w-full h-full" />
                        </button>

                        {/* 제품 정보 */}
                        <div className="flex gap-[18px] mb-[16px]">
                          <img src={product.thumbnail} alt={product.name} className="w-[64px] h-[64px] object-cover" />
                          <div className="flex-1">
                            <div className="text-[13px] text-[#888] mb-[4px]">{product.brand}</div>
                            <div className="text-[16px] font-bold text-[#111] mb-[8px]">{product.name}</div>
                            <a
                              href={availableProducts.find(p => p.id === product.id)?.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-[4px] text-[13px] text-[#00BC7D] hover:underline"
                            >
                              <span>제품 페이지 보기</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>

                        {/* 옵션 선택 */}
                        <div className="mb-[12px]">
                          <div className="flex gap-[2px] items-center text-[14px] font-bold mb-[12px]">
                            <span>옵션</span>
                            <span className="text-[#f83baa]">*</span>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => toggleOptions(product.id)}
                              className="w-full h-[40px] px-[14px] border border-[#dcdee0] rounded-[2px] text-[15px] text-left text-[#a0a0a0] bg-white flex items-center justify-between"
                            >
                              <span>옵션을 선택해 추가하세요</span>
                              <img src={imgDropdownIcon} alt="" className="w-[12px] h-[7px]" />
                            </button>

                            {/* 옵션 드롭다운 */}
                            {product.showOptions && (
                              <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#dcdee0] rounded-[2px] shadow-lg z-10">
                                <button
                                  onClick={() => { addOption(product.id, 'KOYA'); toggleOptions(product.id); }}
                                  className="w-full px-[14px] py-[12px] text-left text-[13px] text-[#616161] hover:bg-gray-50"
                                >
                                  KOYA
                                </button>
                                <button
                                  onClick={() => { addOption(product.id, 'CHIMMY'); toggleOptions(product.id); }}
                                  className="w-full px-[14px] py-[12px] text-left text-[13px] text-[#616161] hover:bg-gray-50"
                                >
                                  CHIMMY
                                </button>
                                <button
                                  onClick={() => { addOption(product.id, '단품'); toggleOptions(product.id); }}
                                  className="w-full px-[14px] py-[12px] text-left text-[13px] text-[#616161] hover:bg-gray-50"
                                >
                                  단품
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 선택된 옵션 목록 */}
                        {product.selectedOptions.length > 0 && (
                          <div className="space-y-[8px]">
                            {product.selectedOptions.map((option) => (
                              <div key={option.id} className="flex items-center justify-between bg-white border border-[#ebedee] rounded-[2px] px-[14px] py-[12px]">
                                <span className="text-[13px] text-[#616161]">{option.name}</span>
                                <div className="flex items-center gap-[8px]">
                                  <div className="flex items-center border border-[#dcdee0] rounded-[2px] h-[30px]">
                                    <button
                                      onClick={() => updateQuantity(product.id, option.id, -20)}
                                      className="w-[30px] h-full flex items-center justify-center text-[14px] text-[#111]"
                                    >
                                      −
                                    </button>
                                    <div className="w-[50px] h-full flex items-center justify-center text-[14px] font-bold border-x border-[#dcdee0]">
                                      {option.quantity}
                                    </div>
                                    <button
                                      onClick={() => updateQuantity(product.id, option.id, 20)}
                                      className="w-[30px] h-full flex items-center justify-center text-[14px] text-[#111]"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeOption(product.id, option.id)}
                                    className="w-[12px] h-[12px]"
                                  >
                                    <img src={imgDeleteIcon} alt="삭제" className="w-full h-full" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 세금계산서 발행 여부 */}
              <div>
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <div className="flex gap-[2px] items-center text-[14px] font-bold">
                    <span>세금계산서 발행 여부</span>
                    <span className="text-[#f83baa]">*</span>
                  </div>
                  <div className="text-[14px] text-[#a0a0a0]">
                    세금계산서 발행시에는 제휴제안으로 문의 바랍니다.
                  </div>
                </div>
                <div className="flex gap-[24px] items-center">
                  <label className="flex gap-[6px] items-center cursor-pointer">
                    <div className="relative w-[18px] h-[18px]">
                      <img src={imgOval} alt="" className="w-full h-full" />
                      {taxInvoice === 'yes' && (
                        <img src={imgOval1} alt="" className="absolute left-[4.5px] top-[4.5px] w-[9px] h-[9px]" />
                      )}
                    </div>
                    <span className="text-[15px]" onClick={() => setTaxInvoice('yes')}>발행</span>
                  </label>
                  <label className="flex gap-[6px] items-center cursor-pointer">
                    <div className="relative w-[18px] h-[18px]">
                      <img src={imgOval2} alt="" className="w-full h-full" />
                      {taxInvoice === 'no' && (
                        <img src={imgOval3} alt="" className="absolute left-[4.5px] top-[4.5px] w-[9px] h-[9px]" />
                      )}
                    </div>
                    <span className="text-[15px]" onClick={() => setTaxInvoice('no')}>미발행</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-[10px] bg-[#f0f2f4] my-[40px]" />

            {/* Privacy Notice */}
            <div className="bg-[#f6f8fa] border border-[#ebedee] rounded-[2px] p-[20px] mb-[40px]">
              <div className="font-bold text-[13px] text-[#616161] mb-[12px]">
                제휴 문의 신청을 위해 아래와 같이 개인정보를 수집 및 이용합니다.
              </div>
              <ul className="text-[13px] text-[#616161] leading-[1.45] list-disc ml-[22.5px] space-y-[4px]">
                <li>수집항목 : (기본정보) 회사명, 브랜드명, 홈페이지 주소 (신청 업체의 담당자 정보) 담당자명, 전화번호, 이메일 주소</li>
                <li>이용목적 : 입점 신청 업체의 상담을 위한 수집, 입점, 상담 관련 민원 사무 처리</li>
                <li>보유기간 : 입점 거절 시 5일 이내 파기</li>
                <li>수집한 개인정보는 입점을 위한 상담 외 다른 목적으로는 이용되지 않습니다.</li>
                <li>개인정보 수집 이용 동의를 거부할 권리가 있습니다. 다만, 동의하지 않을 경우 입점 관련 상담이 불가능합니다.</li>
              </ul>
            </div>
          </>
        )}

        {/* Checkbox */}
        <div className="flex gap-[8px] items-center mb-[40px]">
          <button
            onClick={() => setAgreed(!agreed)}
            className="relative w-[20px] h-[20px] flex-shrink-0"
          >
            <div className="absolute inset-0 bg-black border border-black rounded-[3px]" />
            {agreed && (
              <img src={imgPath} alt="" className="absolute inset-[25%] w-[50%] h-[50%]" />
            )}
          </button>
          <span className="text-[16px] font-bold">
            [필수] 개인정보 수집 및 이용에 동의합니다.
          </span>
        </div>

        {/* Submit Button */}
        <button className="w-full h-[60px] bg-black text-white text-[18px] font-bold rounded-[2px] hover:bg-gray-800 transition-colors">
          문의 등록하기
        </button>
        </div>
      </main>

      {/* Footer Image */}
      <div className="h-[378px] w-full mt-[100px]">
        <img src={imgPcFooter} alt="Footer" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
