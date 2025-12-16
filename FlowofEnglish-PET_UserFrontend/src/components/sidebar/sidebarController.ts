// Central controller for sidebar (NO React here)

let stagesCache: any[] = [];
let activeSubconceptId: string | null = null;

export function setSidebarStages(stages: any[]) {
  stagesCache = stages;
}

export function getSidebarStages() {
  return stagesCache;
}

export function setActiveSubconcept(id: string) {
  if (!id || id === activeSubconceptId) return;

  // remove old active
  if (activeSubconceptId) {
    const prev = document.getElementById(`sub-${activeSubconceptId}`);
    prev?.classList.remove("bg-[#E0F2FE]", "text-[#0EA5E9]");
  }

  // add new active
  const current = document.getElementById(`sub-${id}`);
  current?.classList.add("bg-[#E0F2FE]", "text-[#0EA5E9]");

  activeSubconceptId = id;
}
