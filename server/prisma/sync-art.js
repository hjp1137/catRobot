"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const client_1 = require("@prisma/client");
const ArtManifest_1 = require("../../src/assets/ArtManifest");
const prisma = new client_1.PrismaClient();
async function main() {
    let upserted = 0;
    for (const [artKey, entry] of Object.entries(ArtManifest_1.ART_MANIFEST)) {
        const physical = !entry.virtual && node_fs_1.default.existsSync(node_path_1.default.resolve('..', entry.path));
        const status = entry.virtual ? 'virtual' : physical ? 'physical' : 'missing';
        await prisma.contentArtResource.upsert({
            where: { art_key: artKey },
            create: row(artKey, entry, status),
            update: row(artKey, entry, status),
        });
        upserted += 1;
    }
    console.log(`Art Manifest同步完成：upsert ${upserted}，未删除任何人工数据。`);
}
function row(artKey, entry, status) {
    return {
        art_key: artKey,
        resource_type: entry.type,
        pack_name: entry.pack,
        physical_path: entry.path,
        fallback_art_key: entry.fallback,
        resource_status: status,
        width: entry.width,
        height: entry.height,
        transparent: entry.transparent ?? true,
        enabled: true,
    };
}
main().catch(error => {
    console.error(error);
    process.exit(1);
}).finally(() => prisma.$disconnect());
//# sourceMappingURL=sync-art.js.map