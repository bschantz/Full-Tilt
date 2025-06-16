import {posix} from 'path';
import {deleteAsync} from "del";
import {readdir} from 'fs/promises';

const distPath = posix.resolve('./dist');
const distGlob = posix.join(distPath, '/**');
const distFiles = await readdir(distPath, { recursive: true });
console.log('Deleting:', distGlob);
distFiles.forEach(distFile => console.log(distFile));
await deleteAsync(distGlob, {force: true});


