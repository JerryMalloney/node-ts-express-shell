import { v4 as uuidv4 } from "uuid";

export class uuidAdapter {
  static v4 = () => uuidv4();
}
