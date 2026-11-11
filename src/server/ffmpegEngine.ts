import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { TAKES_DIR, RENDERS_DIR, JOBS_DIR, ShortProject, SourceVideo, saveProject } from './storageManager.ts';

export interface RenderJob {
  id: string;
  projectId: string;
  slug: string;
  version: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputMp4: string;
  thumbnailUrl: string;
  contactSheetUrl: string;
  duration: number;
  renderTimeSeconds?: number;
  renderFps?: number;
  log?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// Probing video file with ffprobe
export function probeVideo(filePath: string) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=width,height,r_frame_rate,codec_name -of json "${filePath}"`;
    const out = execSync(cmd, { encoding: 'utf-8' });
    const data = JSON.parse(out);
    const videoStream = data.streams?.find((s: any) => s.codec_name !== 'aac' && s.width) || data.streams?.[0] || {};
    const duration = Number(data.format?.duration) || 30.0;
    const size = Number(data.format?.size) || 0;
    const sizeMb = Number((size / (1024 * 1024)).toFixed(2));
    const width = videoStream.width || 1080;
    const height = videoStream.height || 1920;

    let fps = 30;
    if (videoStream.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split('/');
      if (parts.length === 2 && Number(parts[1]) > 0) {
        fps = Math.round(Number(parts[0]) / Number(parts[1]));
      }
    }

    return {
      duration: Number(duration.toFixed(2)),
      sizeMb,
      width,
      height,
      fps,
      resolution: `${width}x${height}`,
      codec: videoStream.codec_name || 'h264'
    };
  } catch (err: any) {
    return {
      duration: 30.0,
      sizeMb: 10.0,
      width: 1080,
      height: 1920,
      fps: 30,
      resolution: '1080x1920',
      codec: 'h264'
    };
  }
}

// Extract JPEG thumbnail from video
export function extractThumbnail(videoPath: string, outputPath: string, timeSec = 1.0): boolean {
  try {
    execSync(`ffmpeg -y -ss ${timeSec} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}" 2>/dev/null`);
    return fs.existsSync(outputPath);
  } catch (err) {
    return false;
  }
}

// Generate 12-frame contact sheet from video
export function generateContactSheet(videoPath: string, outputPath: string, durationSec = 30.0): boolean {
  try {
    const interval = Math.max(0.2, durationSec / 12).toFixed(2);
    execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/${interval},scale=360:640,tile=4x3" -vframes 1 -q:v 2 "${outputPath}" 2>/dev/null`);
    return fs.existsSync(outputPath);
  } catch (err) {
    return false;
  }
}

// Scan takes/ directory and get real videos
export function getAvailableTakes(): SourceVideo[] {
  if (!fs.existsSync(TAKES_DIR)) return [];
  const files = fs.readdirSync(TAKES_DIR);
  const videos: SourceVideo[] = [];

  for (const f of files) {
    if (f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm')) {
      const fullPath = path.join(TAKES_DIR, f);
      const thumbName = `${path.parse(f).name}.jpg`;
      const thumbPath = path.join(TAKES_DIR, thumbName);

      if (!fs.existsSync(thumbPath)) {
        extractThumbnail(fullPath, thumbPath, 1.0);
      }

      const info = probeVideo(fullPath);
      videos.push({
        id: `take-${path.parse(f).name}`,
        name: f,
        duration: info.duration,
        resolution: info.resolution,
        sizeMb: info.sizeMb,
        recordedAt: fs.statSync(fullPath).mtime.toISOString().split('T')[0],
        url: `/takes/${f}`,
        thumbnailUrl: fs.existsSync(thumbPath) ? `/takes/${thumbName}` : '',
        path: fullPath
      });
    }
  }

  return videos;
}

// Save uploaded video (base64 or binary buffer) to takes/
export function saveUploadedVideo(filename: string, dataBase64OrBuffer: string | Buffer): SourceVideo {
  if (!fs.existsSync(TAKES_DIR)) fs.mkdirSync(TAKES_DIR, { recursive: true });
  
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPath = path.join(TAKES_DIR, cleanName);

  if (Buffer.isBuffer(dataBase64OrBuffer)) {
    fs.writeFileSync(targetPath, dataBase64OrBuffer);
  } else {
    const base64Data = dataBase64OrBuffer.replace(/^data:video\/[a-z0-9]+;base64,/, '');
    fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
  }

  const thumbName = `${path.parse(cleanName).name}.jpg`;
  const thumbPath = path.join(TAKES_DIR, thumbName);
  extractThumbnail(targetPath, thumbPath, 1.0);

  const info = probeVideo(targetPath);

  return {
    id: `take-${path.parse(cleanName).name}`,
    name: cleanName,
    duration: info.duration,
    resolution: info.resolution,
    sizeMb: info.sizeMb,
    recordedAt: new Date().toISOString().split('T')[0],
    url: `/takes/${cleanName}`,
    thumbnailUrl: `/takes/${thumbName}`,
    path: targetPath
  };
}

// Download remote video to takes/
export async function downloadRemoteVideo(url: string, filename?: string): Promise<SourceVideo> {
  if (!fs.existsSync(TAKES_DIR)) fs.mkdirSync(TAKES_DIR, { recursive: true });

  const finalName = filename || `download-${Date.now()}.mp4`;
  const cleanName = finalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPath = path.join(TAKES_DIR, cleanName);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Échec du téléchargement: ${res.statusText}`);

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));

  const thumbName = `${path.parse(cleanName).name}.jpg`;
  const thumbPath = path.join(TAKES_DIR, thumbName);
  extractThumbnail(targetPath, thumbPath, 1.0);

  const info = probeVideo(targetPath);

  return {
    id: `take-${path.parse(cleanName).name}`,
    name: cleanName,
    duration: info.duration,
    resolution: info.resolution,
    sizeMb: info.sizeMb,
    recordedAt: new Date().toISOString().split('T')[0],
    url: `/takes/${cleanName}`,
    thumbnailUrl: `/takes/${thumbName}`,
    path: targetPath
  };
}

// Job Storage
export function saveJob(job: RenderJob) {
  if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
  fs.writeFileSync(path.join(JOBS_DIR, `${job.id}.json`), JSON.stringify(job, null, 2), 'utf-8');
}

export function getJob(jobId: string): RenderJob | null {
  const p = path.join(JOBS_DIR, `${jobId}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

// Real Video Render Pipeline with FFmpeg
export function startRenderShort(
  project: ShortProject,
  version: string,
  options: { quality?: string; fps?: number } = {}
): RenderJob {
  if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR, { recursive: true });

  const jobId = `job-render-${Date.now()}`;
  const outFileName = `${project.slug}_${version}.mp4`;
  const outputMp4 = path.join(RENDERS_DIR, outFileName);
  const outThumb = path.join(RENDERS_DIR, `${project.slug}_${version}_thumb.jpg`);
  const outContact = path.join(RENDERS_DIR, `${project.slug}_${version}_contact.jpg`);

  const job: RenderJob = {
    id: jobId,
    projectId: project.id,
    slug: project.slug,
    version,
    status: 'processing',
    progress: 5,
    outputMp4: `/renders/${outFileName}`,
    thumbnailUrl: `/renders/${project.slug}_${version}_thumb.jpg`,
    contactSheetUrl: `/renders/${project.slug}_${version}_contact.jpg`,
    duration: project.duration,
    startedAt: new Date().toISOString()
  };

  saveJob(job);

  // Check for source take video
  const takes = getAvailableTakes();
  let sourceTakePath: string | null = null;

  if (project.sourceVideoName) {
    const found = takes.find(t => t.name === project.sourceVideoName);
    if (found?.path && fs.existsSync(found.path)) {
      sourceTakePath = found.path;
    }
  }

  if (!sourceTakePath && takes.length > 0) {
    sourceTakePath = takes[0].path || null;
  }

  // FFmpeg arguments
  const renderFps = options.fps || project.fps || 30;
  const dur = Math.min(project.duration || 30, 60);
  const startTime = Date.now();

  let ffmpegArgs: string[] = [];

  if (sourceTakePath && fs.existsSync(sourceTakePath)) {
    // Mode with real take rush: crop & scale to 9:16 vertical 1080x1920
    const filter = [
      `scale=1080:1920:force_original_aspect_ratio=increase`,
      `crop=1080:1920`,
      `drawtext=text='${project.title.replace(/[':\\]/g, ' ')}':fontsize=46:fontcolor=white:box=1:boxcolor=0x18181bee:boxborderw=20:x=(w-text_w)/2:y=180`
    ].join(',');

    ffmpegArgs = [
      '-y',
      '-ss', '0',
      '-i', sourceTakePath,
      '-t', dur.toString(),
      '-vf', filter,
      '-r', renderFps.toString(),
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', options.quality === 'final' ? '19' : '23',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputMp4
    ];
  } else {
    // Faceless Explainer Mode: create 1080x1920 vertical motion canvas with colored background
    const filter = [
      `drawtext=text='${project.title.replace(/[':\\]/g, ' ')}':fontsize=52:fontcolor=white:box=1:boxcolor=0x18181bee:boxborderw=24:x=(w-text_w)/2:y=400`,
      `drawtext=text='Video Agent Studio VF':fontsize=36:fontcolor=0xFF6B00:x=(w-text_w)/2:y=520`
    ].join(',');

    ffmpegArgs = [
      '-y',
      '-f', 'lavfi',
      '-i', `color=c=0x0f172a:s=1080x1920:d=${dur}`,
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-vf', filter,
      '-r', renderFps.toString(),
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-t', dur.toString(),
      '-c:a', 'aac',
      '-movflags', '+faststart',
      outputMp4
    ];
  }

  // Spawn FFmpeg in background
  const proc = spawn('ffmpeg', ffmpegArgs);
  let stderrLog = '';

  proc.stderr.on('data', chunk => {
    const txt = chunk.toString();
    stderrLog += txt;

    // Parse time= to update progress
    const match = txt.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      const seconds = Number(match[3]);
      const currentSec = hours * 3600 + minutes * 60 + seconds;
      const pct = Math.min(95, Math.round((currentSec / dur) * 100));
      if (pct > job.progress) {
        job.progress = pct;
        saveJob(job);
      }
    }
  });

  proc.on('close', code => {
    const elapsedSec = Number(((Date.now() - startTime) / 1000).toFixed(2));
    const renderFpsActual = Number(((dur * renderFps) / Math.max(elapsedSec, 0.1)).toFixed(1));

    if (code === 0 && fs.existsSync(outputMp4)) {
      extractThumbnail(outputMp4, outThumb, 1.0);
      generateContactSheet(outputMp4, outContact, dur);

      job.status = 'completed';
      job.progress = 100;
      job.renderTimeSeconds = elapsedSec;
      job.renderFps = renderFpsActual;
      job.completedAt = new Date().toISOString();
      job.log = 'Rendu terminé avec succès par FFmpeg.';

      // Update project version status
      const existingVer = project.versions.find(v => v.version === version);
      if (existingVer) {
        existingVer.status = 'done';
        existingVer.outputMp4 = job.outputMp4;
      } else {
        project.versions.unshift({
          version,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'done',
          duration: dur,
          fps: renderFps,
          notes: `Rendu FFmpeg ${options.quality || 'draft'} produit en ${elapsedSec}s.`,
          outputMp4: job.outputMp4
        });
      }
      project.currentVersion = version;
      project.status = 'ready';
      saveProject(project);
    } else {
      job.status = 'failed';
      job.error = `FFmpeg a échoué avec le code ${code}`;
      job.log = stderrLog.slice(-1000);
    }

    saveJob(job);
  });

  return job;
}
