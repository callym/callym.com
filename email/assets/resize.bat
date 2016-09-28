@echo off
cd %1
for %%f in (*.jpg) do (
echo %%f
echo %%~nf
magick convert %%f ^
 -resize "200^>" ^
 -gravity Center ^
 -crop 200x200+0+0 ^
 -strip %%~nf_thumbnail.jpg
)
cd %~dp0