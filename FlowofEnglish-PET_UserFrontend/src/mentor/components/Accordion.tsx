import React, { useState } from "react";

export default function Accordion({ title, children }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md p-2">
      <button className="w-full text-left font-medium" onClick={() => setOpen(!open)}>
        {title}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
