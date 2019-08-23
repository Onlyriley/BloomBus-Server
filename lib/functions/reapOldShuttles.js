"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * dbRef: Reference to the 'shuttles' reference, needed to perform update operation.
 * reapShuttleThresholdMilliseconds: Timeout threshold. Shuttle nodes older than this will be deleted.
 */
function reapOldShuttles(dbRef, reapShuttleThresholdMilliseconds) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        const cutoff = now - reapShuttleThresholdMilliseconds;
        const oldItemsQuery = dbRef.orderByChild("properties/timestamp").endAt(cutoff);
        const snapshot = yield oldItemsQuery.once("value");
        // create a map with all children that need to be removed
        const updates = {};
        snapshot.forEach(child => {
            updates[child.key] = null;
            return true;
        });
        // execute all updates in one go and return the result to end the function
        return dbRef.update(updates);
    });
}
exports.default = reapOldShuttles;
;
//# sourceMappingURL=reapOldShuttles.js.map