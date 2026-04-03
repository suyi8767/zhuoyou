import { Injectable } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import type { DashboardState } from "./models";
import { createSeedData } from "./seed";

function resolveDataFile() {
  const cwd = process.cwd();
  if (cwd.endsWith(path.join("apps", "server"))) {
    return path.join(cwd, "data", "mock-db.json");
  }
  return path.join(cwd, "apps", "server", "data", "mock-db.json");
}

@Injectable()
export class DataStoreService {
  private readonly dataFile = resolveDataFile();
  private state: DashboardState;

  constructor() {
    this.ensureDataFile();
    this.state = this.readFromDisk();
  }

  getState() {
    return this.state;
  }

  update(mutator: (state: DashboardState) => void) {
    mutator(this.state);
    this.writeToDisk();
    return this.state;
  }

  private ensureDataFile() {
    const dir = path.dirname(this.dataFile);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(
        this.dataFile,
        JSON.stringify(createSeedData(), null, 2),
        "utf-8",
      );
    }
  }

  private readFromDisk() {
    return JSON.parse(fs.readFileSync(this.dataFile, "utf-8")) as DashboardState;
  }

  private writeToDisk() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.state, null, 2), "utf-8");
  }
}

