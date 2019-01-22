import { SQLServe } from "./SQLServe";
import { Cmd } from "../protobuf/common";
import { PlayerCenter } from "./PlayerCenter";
import { MyWebSocket } from "./MyWebSocket";
export class MsgHandler {
    private static _handler: MsgHandler = null; // 实例
    private _target: any = null; // 外部应用（MyWebScoket实例）
    /**
     * 获取单例
     * @param target 
     */
    public static getInstance(target: MyWebSocket): MsgHandler {
        if (!this._handler) {
            this._handler = new MsgHandler(target);
        }
        return this._handler;
    };
    /**
     *  构造函数
     */
    constructor(target) {
        this._target = target
    };
    public handler(event: string, msgData: any, uid: number) {
        switch (event) {
            /* 物品变更 */
            case "Cmd.ItemUpdate_CS":
                let data: Cmd.ItemUpdate_CS = msgData as Cmd.ItemUpdate_CS;
                this._itemUpdate(data);
                break;


            case "Cmd.AcheiveTask_CS":
                let data2: Cmd.AcheiveTask_CS = msgData as Cmd.AcheiveTask_CS;
                let task: Cmd.TaskUpdate_CS = PlayerCenter.getTaskInfo(uid)
                for (let item of task.taskInfo) {
                    if (item.taskID == data2.taskID) {
                        /* 已完成 */
                        if (item.taskState == 1) {
                            item.taskState = 2;
                            MyWebSocket.instance.sendMsg(uid, task)
                        }
                        else {
                            console.assert(false, "逻辑有误")
                        }
                        break;
                    }
                }
                break;
        }
    };




    private _itemUpdate(data): void {
        let itemInfo = data.itemInfo;
        // data2.uid = data2.uid;
        PlayerCenter.clearUpdateNum(data.uid);
        for (let item of itemInfo) {
            if (item.itemUpdateNum && item.itemUpdateNum != 0) {
                PlayerCenter.updateProp(data.uid, item.itemID, item.itemUpdateNum);
            }
        }
        PlayerCenter.sendPropData(data.uid);
    };
};
global["MsgHandler"] = MsgHandler;