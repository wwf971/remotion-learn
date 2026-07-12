import React from "react";
import "./skillPanel.css";

export type SkillFileView = {
  id: string;
  label: string;
  depth: number;
  isDir: boolean;
  // 0 = unread; fades towards 1 when the file gets marked as read.
  readOpacity: number;
};

// A panel showing a skill's folder structure. Rows are indented by depth;
// read files get a green tint and a "read" tag.
export const SkillPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  title: string;
  files: SkillFileView[];
}> = ({ x, y, width, title, files }) => {
  return (
    <div className="skill-panel" style={{ left: x, top: y, width }}>
      <div className="skill-panel-title">{title}</div>
      {files.map((file) => (
        <div
          key={file.id}
          className="skill-file-row"
          style={{
            paddingLeft: 8 + file.depth * 18,
            backgroundColor: `rgba(120, 200, 140, ${0.3 * file.readOpacity})`,
          }}
        >
          <div
            className={
              file.isDir ? "skill-file-label-dir" : "skill-file-label"
            }
          >
            {file.label}
          </div>
          <div
            className="skill-file-read-tag"
            style={{ opacity: file.readOpacity }}
          >
            read
          </div>
        </div>
      ))}
    </div>
  );
};
