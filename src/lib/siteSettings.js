import { supabase } from "./supabase";

export const defaultSiteSettings = {
  artist_name: "",
  about_title: "작업과 생각을 소개하는 공간",
  about_content: `
    <p>이 페이지는 작가 소개와 작업 세계를 보여주는 소개 페이지입니다.</p>
    <p>관리자 화면에서 소개 문구와 문의 수신 이메일을 자유롭게 수정할 수 있습니다.</p>
  `.trim(),
  contact_email: "psykor48@gmail.com",
  contact_intro: "의뢰, 협업, 전시 문의는 아래 폼 또는 이메일로 보내주세요.",
};

export async function fetchSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  if (error || !data) {
    return defaultSiteSettings;
  }

  return {
    ...defaultSiteSettings,
    ...data,
  };
}

export async function saveSiteSettings(settings) {
  return supabase.from("site_settings").upsert(
    {
      id: 1,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}
