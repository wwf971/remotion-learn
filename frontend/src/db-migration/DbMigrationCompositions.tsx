import React from "react";
import { Composition, Folder } from "remotion";
import { DbMigrationVideo } from "./DbMigrationVideo";
import {
  DB_MIGRATION_FPS,
  dbMigrationDuration,
  dbMigrationEpisodes,
} from "./DbMigrationTimeline";

export const DbMigrationCompositions: React.FC = () => (
  <Folder name="DbMigration">
    <Composition
      id="DbMigrationComplete"
      component={DbMigrationVideo}
      durationInFrames={dbMigrationDuration()}
      fps={DB_MIGRATION_FPS}
      width={1920}
      height={1080}
    />
    {dbMigrationEpisodes.map((episode) => (
      <Composition
        key={episode.id}
        id={episode.id}
        component={DbMigrationVideo}
        defaultProps={{ phase: episode.phase }}
        durationInFrames={dbMigrationDuration(episode.phase)}
        fps={DB_MIGRATION_FPS}
        width={1920}
        height={1080}
      />
    ))}
  </Folder>
);
