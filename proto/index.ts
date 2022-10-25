import { exit } from "process";
import { Schema, Client, Entity } from "../lib";

interface WorkflowInstance {
  name: string;
  id: string;
  nameId: string;
  status: string;
  startedAt: Date;
  createdAt: Date;
  failedAt: Date;
  completedAt: Date;
  running: boolean;
  working: boolean;
  ready: boolean;
  started: boolean;
  state: Record<string, any>;
  input: Record<string, any>;
  result: Record<string, any>;
}

class WorkflowInstance extends Entity {
  status: string;
  createdAt: Date;
  id: string;
  running: boolean;
  ready: boolean;
  workflowName: any;

  constructor(schema: Schema<WorkflowInstance>, id: string, data?: any) {
    super(schema, id, data);
    this.status = "created";
    this.createdAt = new Date();
    this.id = id;
    this.running = false;
    this.ready = true;
  }

  toObject() {
    return {
      id: this.id,
      entityId: this.entityId,
      nameId: this.nameId,
      status: this.status,
      startedAt: this.startedAt,
      createdAt: this.createdAt,
      failedAt: this.failedAt,
      completedAt: this.completedAt,
      running: this.running,
      working: this.working,
      state: JSON.stringify(this.state),
      ready: this.ready,
      started: this.started,
      workflowName: this.workflowName,
      input: JSON.stringify(this.input),
    };
  }

  getTasks() {
    //@ts-ignore
    return this.tasks;
  }

  addTask(task: any) {
    //@ts-ignore
    this.tasks.push(task);
  } // addTask
}

const workflowSchema = new Schema(
  WorkflowInstance,
  {
    name: { type: "string" },
    workflowName: { type: "string" },
    history: { type: "string[]" },
    input: { type: "string" },
    id: { type: "string" },
    nameId: { type: "string" },
    status: { type: "string" },
    createdAt: { type: "date" },
    startedAt: { type: "date" },
    failedAt: { type: "date" },
    completedAt: { type: "date" },
    running: { type: "boolean" },
    state: { type: "string" },
    working: { type: "boolean" },
    error: { type: "string" },
    started: { type: "boolean" },
    ready: { type: "boolean" },
    tasks: {
      type: "object",
      fields: { id: { type: "string" }, status: { type: "string" } },
    },
  },
  {
    prefix: "nexus:workflows",
  }
);

const main = async () => {
  const om = await new Client().open("redis://:@localhost:6379");

  const workflowRepository = om.fetchRepository(workflowSchema);

  await workflowRepository.createIndex();

  const info = await workflowRepository.createEntity({
    status: "created",
    tasks: [
      { id: "1", status: "created" },
      { id: "2", status: "created" },
    ],
  });

  console.log(info);

  const info2 = await workflowRepository.save(info);
  const record = await workflowRepository.fetch(info2);

  //@ts-ignore
  record?.addTask({ id: "3", status: "created" });

  //@ts-ignore

  exit();
};

main();
