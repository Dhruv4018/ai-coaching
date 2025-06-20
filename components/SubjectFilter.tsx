"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery, removeKeysFromUrlQuery } from "@jsmastery/utils";
import { subjects } from "@/constants";

const SubjectFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("subject") || "";
  const [subject, setSubject] = useState(query);

  useEffect(() => {
    let newUrl = "";

    if (subject === "all") {
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["subject"],
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "subject",
        value: subject,
      });
    }

    router.push(newUrl, { scroll: false });
  }, [subject, searchParams, router]);

  return (
    <div className="flex justify-end w-full"> {/* 👈 Align to right */}
      <div className="w-[180px]">
        <Select onValueChange={setSubject} value={subject}>
          <SelectTrigger className="input capitalize w-full">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject} className="capitalize">
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SubjectFilter;
