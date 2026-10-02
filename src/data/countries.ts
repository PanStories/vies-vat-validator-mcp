// Supported VAT countries for VIES validation.
// Bilingual names (中文 / English). Covers the EU 27 + United Kingdom (GB)
// and Northern Ireland (XI), which VIES exposes.

export interface CountryInfo {
  /** ISO country code used by VIES (2 letters, uppercase). */
  code: string;
  /** 中文名 */
  nameZh: string;
  /** English name */
  nameEn: string;
  /** Whether this is an EU member state (vs UK/XI handled separately). */
  eu: boolean;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "AT", nameZh: "奥地利", nameEn: "Austria", eu: true },
  { code: "BE", nameZh: "比利时", nameEn: "Belgium", eu: true },
  { code: "BG", nameZh: "保加利亚", nameEn: "Bulgaria", eu: true },
  { code: "CY", nameZh: "塞浦路斯", nameEn: "Cyprus", eu: true },
  { code: "CZ", nameZh: "捷克", nameEn: "Czech Republic", eu: true },
  { code: "DE", nameZh: "德国", nameEn: "Germany", eu: true },
  { code: "DK", nameZh: "丹麦", nameEn: "Denmark", eu: true },
  { code: "EE", nameZh: "爱沙尼亚", nameEn: "Estonia", eu: true },
  { code: "EL", nameZh: "希腊", nameEn: "Greece", eu: true },
  { code: "ES", nameZh: "西班牙", nameEn: "Spain", eu: true },
  { code: "FI", nameZh: "芬兰", nameEn: "Finland", eu: true },
  { code: "FR", nameZh: "法国", nameEn: "France", eu: true },
  { code: "HR", nameZh: "克罗地亚", nameEn: "Croatia", eu: true },
  { code: "HU", nameZh: "匈牙利", nameEn: "Hungary", eu: true },
  { code: "IE", nameZh: "爱尔兰", nameEn: "Ireland", eu: true },
  { code: "IT", nameZh: "意大利", nameEn: "Italy", eu: true },
  { code: "LT", nameZh: "立陶宛", nameEn: "Lithuania", eu: true },
  { code: "LU", nameZh: "卢森堡", nameEn: "Luxembourg", eu: true },
  { code: "LV", nameZh: "拉脱维亚", nameEn: "Latvia", eu: true },
  { code: "MT", nameZh: "马耳他", nameEn: "Malta", eu: true },
  { code: "NL", nameZh: "荷兰", nameEn: "Netherlands", eu: true },
  { code: "PL", nameZh: "波兰", nameEn: "Poland", eu: true },
  { code: "PT", nameZh: "葡萄牙", nameEn: "Portugal", eu: true },
  { code: "RO", nameZh: "罗马尼亚", nameEn: "Romania", eu: true },
  { code: "SE", nameZh: "瑞典", nameEn: "Sweden", eu: true },
  { code: "SI", nameZh: "斯洛文尼亚", nameEn: "Slovenia", eu: true },
  { code: "SK", nameZh: "斯洛伐克", nameEn: "Slovakia", eu: true },
  { code: "GB", nameZh: "英国", nameEn: "United Kingdom", eu: false },
  { code: "XI", nameZh: "北爱尔兰", nameEn: "Northern Ireland", eu: false },
];

const CODE_SET = new Set(COUNTRIES.map((c) => c.code));

export function isSupportedCountry(code: string): boolean {
  return CODE_SET.has(code.toUpperCase());
}

export function getCountry(code: string): CountryInfo | undefined {
  const up = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === up);
}
