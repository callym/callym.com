orig_folder=$(pwd);
cd $1;
for f in *.jpg
do (
	echo $f;
	convert $f \
		-resize "200^>" \
		-gravity Center \
		-crop 200x200+0+0 \
		-strip ${f%.*}_thumbnail.jpg
)
done;
cd $orig_folder;
